import { connectToDatabase } from "@/lib/db";
import { Property, PropertyType } from "@/models/Property";
import { Investment, InvestmentStatus } from "@/models/Investment";
import { User } from "@/models/User";
import { Role } from "@/models/Role";

export async function seedInvestments() {
    try {
        await connectToDatabase();

        // Get user role
        const userRole = await Role.findOne({ name: "user" });
        if (!userRole) {
            throw new Error("User role not found. Please ensure roles are seeded first.");
        }

        // Create test investor users
        const investors = [
            {
                firstName: "Omar",
                lastName: "Ahmed",
                email: "investor1@example.com",
                phone: "+201111111111"
            },
            {
                firstName: "Nour",
                lastName: "Hassan",
                email: "investor2@example.com",
                phone: "+201111111112"
            },
            {
                firstName: "Karim",
                lastName: "Mohamed",
                email: "investor3@example.com",
                phone: "+201111111113"
            },
            {
                firstName: "Yasmin",
                lastName: "Ali",
                email: "investor4@example.com",
                phone: "+201111111114"
            },
            {
                firstName: "Amr",
                lastName: "Mahmoud",
                email: "investor5@example.com",
                phone: "+201111111115"
            }
        ];

        const createdInvestors = [];
        for (const investorData of investors) {
            let investor = await User.findOne({ email: investorData.email });
            if (!investor) {
                investor = new User({
                    ...investorData,
                    roleId: userRole._id,
                    status: "active",
                    emailVerifiedAt: new Date(),
                    phoneVerifiedAt: new Date()
                });
                await investor.save();
            }
            createdInvestors.push(investor);
        }

        // Get available properties
        const properties = await Property.find({ isActive: true });
        
        if (properties.length === 0) {
            throw new Error("No properties found. Please seed properties first.");
        }

        // Clear existing investments
        await Investment.deleteMany({});

        const investments = [];

        // Create investments for single properties
        const singleProperties = properties.filter(p => p.type === PropertyType.SINGLE);
        
        for (const property of singleProperties) {
            // Create 2-3 investments per single property
            const numInvestments = Math.floor(Math.random() * 2) + 2; // 2-3 investments
            
            for (let i = 0; i < numInvestments && i < createdInvestors.length; i++) {
                const investor = createdInvestors[i];
                const maxShares = property.maxSharesPerUser || 5;
                const sharesInvested = Math.floor(Math.random() * maxShares) + 1;
                
                // Check if enough shares available
                if (property.availableShares >= sharesInvested) {
                    const investment = new Investment({
                        userId: investor._id,
                        propertyId: property._id,
                        sharesInvested,
                        sharePrice: property.sharePrice,
                        totalInvestment: sharesInvested * property.sharePrice,
                        downPayment: sharesInvested * property.shareDownPayment,
                        installmentAmount: sharesInvested * property.shareInstallment,
                        numberOfInstallments: property.numberOfInstallments,
                        status: InvestmentStatus.ACTIVE,
                        downPaymentPaid: true,
                        downPaymentDate: new Date(),
                        investmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
                        firstInstallmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Start next month
                    });

                    // Generate installments
                    investment.generateInstallments();
                    
                    // Randomly pay some installments
                    const paidInstallments = Math.floor(Math.random() * 3); // 0-2 paid installments
                    for (let j = 0; j < paidInstallments && j < investment.installments.length; j++) {
                        const installment = investment.installments[j];
                        installment.status = 'paid';
                        installment.paidDate = new Date(Date.now() - (30 - j * 10) * 24 * 60 * 60 * 1000);
                        installment.transactionId = `TXN-${Date.now()}-${j}`;
                    }

                    await investment.save();
                    
                    // Update property shares
                    property.availableShares -= sharesInvested;
                    property.totalInvested += investment.totalInvestment;
                    
                    investments.push(investment);
                }
            }
            
            await property.save();
        }

        // Create investments for projects (larger investments)
        const projects = properties.filter(p => p.type === PropertyType.PROJECT);
        
        for (const project of projects) {
            // Create 1-2 large investments per project
            const numInvestments = Math.floor(Math.random() * 2) + 1;
            
            for (let i = 0; i < numInvestments && i < createdInvestors.length; i++) {
                const investor = createdInvestors[i + 2]; // Use different investors
                const sharesInvested = Math.floor(Math.random() * 1000) + 500; // 500-1500 shares
                
                if (project.availableShares >= sharesInvested) {
                    const investment = new Investment({
                        userId: investor._id,
                        propertyId: project._id,
                        sharesInvested,
                        sharePrice: project.sharePrice,
                        totalInvestment: sharesInvested * project.sharePrice,
                        downPayment: sharesInvested * project.shareDownPayment,
                        installmentAmount: sharesInvested * project.shareInstallment,
                        numberOfInstallments: project.numberOfInstallments,
                        status: InvestmentStatus.ACTIVE,
                        downPaymentPaid: true,
                        downPaymentDate: new Date(),
                        investmentDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date in last 60 days
                        firstInstallmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Started last month
                    });

                    investment.generateInstallments();
                    
                    // Pay more installments for projects (they start immediately)
                    const paidInstallments = Math.floor(Math.random() * 5) + 1; // 1-5 paid installments
                    for (let j = 0; j < paidInstallments && j < investment.installments.length; j++) {
                        const installment = investment.installments[j];
                        installment.status = 'paid';
                        installment.paidDate = new Date(Date.now() - (60 - j * 10) * 24 * 60 * 60 * 1000);
                        installment.transactionId = `PRJ-TXN-${Date.now()}-${j}`;
                    }

                    await investment.save();
                    
                    project.availableShares -= sharesInvested;
                    project.totalInvested += investment.totalInvestment;
                    
                    investments.push(investment);
                }
            }
            
            await project.save();
        }

        // Create investments for bundles
        const bundles = properties.filter(p => p.type === PropertyType.BUNDLE);
        
        for (const bundle of bundles) {
            // Create 1-2 investments per bundle
            const numInvestments = Math.floor(Math.random() * 2) + 1;
            
            for (let i = 0; i < numInvestments && i < createdInvestors.length; i++) {
                const investor = createdInvestors[i + 1]; // Use different investors
                const maxShares = bundle.maxSharesPerUser || 20;
                const sharesInvested = Math.floor(Math.random() * maxShares) + 5; // 5-max shares
                
                if (bundle.availableShares >= sharesInvested) {
                    const investment = new Investment({
                        userId: investor._id,
                        propertyId: bundle._id,
                        sharesInvested,
                        sharePrice: bundle.sharePrice,
                        totalInvestment: sharesInvested * bundle.sharePrice,
                        downPayment: sharesInvested * bundle.shareDownPayment,
                        installmentAmount: sharesInvested * bundle.shareInstallment,
                        numberOfInstallments: bundle.numberOfInstallments,
                        status: InvestmentStatus.PENDING, // Some bundles still pending
                        downPaymentPaid: Math.random() > 0.5, // 50% chance paid
                        downPaymentDate: Math.random() > 0.5 ? new Date() : undefined,
                        investmentDate: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000), // Random date in last 45 days
                        firstInstallmentDate: null // Will be set when bundle is fully funded
                    });

                    // Only generate installments if down payment is paid
                    if (investment.downPaymentPaid) {
                        investment.status = InvestmentStatus.ACTIVE;
                        investment.firstInstallmentDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // Start in 15 days
                        investment.generateInstallments();
                    }

                    await investment.save();
                    
                    bundle.availableShares -= sharesInvested;
                    if (investment.downPaymentPaid) {
                        bundle.totalInvested += investment.totalInvestment;
                    }
                    
                    investments.push(investment);
                }
            }
            
            await bundle.save();
        }

        console.log("✅ Investment seeding completed successfully!");
        
        return {
            investorsCreated: createdInvestors.length,
            investmentsCreated: investments.length,
            singlePropertyInvestments: investments.filter(inv => 
                properties.find(p => p._id.toString() === inv.propertyId.toString())?.type === PropertyType.SINGLE
            ).length,
            projectInvestments: investments.filter(inv => 
                properties.find(p => p._id.toString() === inv.propertyId.toString())?.type === PropertyType.PROJECT
            ).length,
            bundleInvestments: investments.filter(inv => 
                properties.find(p => p._id.toString() === inv.propertyId.toString())?.type === PropertyType.BUNDLE
            ).length
        };

    } catch (error) {
        console.error("❌ Error seeding investments:", error);
        throw error;
    }
}
