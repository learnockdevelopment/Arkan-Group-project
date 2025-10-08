import { connectToDatabase } from "@/lib/db";
import { Contact, ContactCategory, ContactStatus, ContactPriority } from "@/models/Contact";
import { User } from "@/models/User";
import { Role } from "@/models/Role";

export async function seedContacts() {
    try {
        await connectToDatabase();

        // Get users for linking some contacts
        const userRole = await Role.findOne({ name: "user" });
        const adminRole = await Role.findOne({ name: "admin" });
        
        const users = await User.find({ roleId: userRole?._id }).limit(5);
        let admins = await User.find({ roleId: adminRole?._id }).limit(2);
        
        // Create admin users if none exist
        if (admins.length === 0 && adminRole) {
            console.log("No admin users found for contact assignment, creating support admins...");
            
            const supportAdmins = [
                {
                    firstName: "Support",
                    lastName: "Admin",
                    email: "support.admin@arkan.com",
                    phone: "+201000000020",
                    roleId: adminRole._id,
                    status: "active",
                    emailVerifiedAt: new Date(),
                    phoneVerifiedAt: new Date()
                },
                {
                    firstName: "Customer",
                    lastName: "Service",
                    email: "customer.service@arkan.com",
                    phone: "+201000000021",
                    roleId: adminRole._id,
                    status: "active",
                    emailVerifiedAt: new Date(),
                    phoneVerifiedAt: new Date()
                }
            ];

            for (const adminData of supportAdmins) {
                const existingAdmin = await User.findOne({ email: adminData.email });
                if (!existingAdmin) {
                    const admin = new User(adminData);
                    await admin.save();
                    admins.push(admin);
                } else {
                    admins.push(existingAdmin);
                }
            }
        }

        // Clear existing contacts
        await Contact.deleteMany({});

        // Sample contact data
        const contacts = [
            {
                firstName: "Sarah",
                lastName: "Johnson",
                email: "sarah.johnson@email.com",
                phone: "+201234567890",
                userId: users[0]?._id || undefined || undefined, // Link to user if available
                subject: "Question about Investment Process",
                message: "Hi, I'm interested in investing in real estate through your platform. Could you please explain how the fractional ownership works and what are the minimum investment amounts? I'm particularly interested in North Coast properties.",
                category: ContactCategory.INVESTMENT_QUESTION,
                status: ContactStatus.RESOLVED,
                priority: ContactPriority.MEDIUM,
                assignedTo: admins[0]?._id || undefined,
                adminResponse: "Thank you for your interest in Arkan! Fractional ownership allows you to invest in premium properties with smaller amounts. The minimum investment varies by property, typically starting from 10,000 EGP. I've sent you detailed information via email. Feel free to schedule a call if you need further clarification.",
                responseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                resolvedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                ipAddress: "192.168.1.100",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                internalNotes: [
                    {
                        note: "User seems genuinely interested. Sent comprehensive investment guide.",
                        addedBy: admins[0]?._id || undefined,
                        addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                    }
                ]
            },
            {
                firstName: "Ahmed",
                lastName: "Mohamed",
                email: "ahmed.mohamed@gmail.com",
                phone: "+201987654321",
                userId: users[1]?._id || undefined,
                subject: "Technical Issue with Mobile App",
                message: "I'm having trouble logging into the mobile app. It keeps showing 'Invalid credentials' even though I'm using the correct email and PIN. I've tried resetting my PIN but the issue persists. Please help!",
                category: ContactCategory.TECHNICAL_SUPPORT,
                status: ContactStatus.IN_PROGRESS,
                priority: ContactPriority.HIGH,
                assignedTo: admins[1]?._id || undefined,
                adminResponse: "I apologize for the inconvenience. I can see the issue in our system. It appears to be related to a recent app update. Our technical team is working on a fix. In the meantime, you can access your account through our website. I'll update you once the mobile app issue is resolved.",
                responseDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                ipAddress: "192.168.1.101",
                userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
                internalNotes: [
                    {
                        note: "Escalated to technical team. Known issue with iOS app version 2.1.3",
                        addedBy: admins[1]?._id || undefined,
                        addedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
                    }
                ],
                followUpRequired: true,
                followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
            },
            {
                firstName: "Mariam",
                lastName: "Hassan",
                email: "mariam.hassan@yahoo.com",
                phone: "+201555666777",
                subject: "Partnership Opportunity",
                message: "Good day! I represent a real estate development company interested in listing our projects on your platform. We have several upcoming developments in New Cairo and the North Coast. Could we schedule a meeting to discuss partnership opportunities?",
                category: ContactCategory.PARTNERSHIP,
                status: ContactStatus.NEW,
                priority: ContactPriority.HIGH,
                ipAddress: "192.168.1.102",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            },
            {
                firstName: "Omar",
                lastName: "Khaled",
                email: "omar.khaled@hotmail.com",
                phone: "+201444555666",
                userId: users[2]?._id || undefined,
                subject: "Account Verification Issue",
                message: "I submitted my ID verification documents 5 days ago but haven't received any update. My account is still showing as unverified. I need to make a withdrawal but can't proceed without verification. Please check the status of my application.",
                category: ContactCategory.ACCOUNT_ISSUE,
                status: ContactStatus.IN_PROGRESS,
                priority: ContactPriority.MEDIUM,
                assignedTo: admins[0]?._id || undefined,
                adminResponse: "Thank you for contacting us. I've checked your verification status and can see your documents are currently under review. Our verification team processes applications within 3-5 business days. I've flagged your application for priority review and you should receive an update within 24 hours.",
                responseDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
                ipAddress: "192.168.1.103",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                internalNotes: [
                    {
                        note: "Verification documents look good. Forwarded to verification team for priority processing.",
                        addedBy: admins[0]?._id || undefined,
                        addedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
                    }
                ]
            },
            {
                firstName: "Nour",
                lastName: "Abdel Rahman",
                email: "nour.abdel@gmail.com",
                phone: "+201333444555",
                subject: "Property Information Request",
                message: "I'm interested in the luxury villa project in New Cairo that's currently available for investment. Could you provide more details about the expected completion date, rental yields, and the developer's track record?",
                category: ContactCategory.PROPERTY_INQUIRY,
                status: ContactStatus.RESOLVED,
                priority: ContactPriority.MEDIUM,
                assignedTo: admins[1]?._id || undefined,
                adminResponse: "Thank you for your interest in our New Cairo villa project! The project is developed by Ahmed Hassan, a reputable developer with 15+ years of experience. Expected completion is Q2 2025 with projected rental yields of 12-15% annually. I've sent you the detailed project brochure and financial projections via email.",
                responseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                resolvedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                ipAddress: "192.168.1.104",
                userAgent: "Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0",
                satisfactionRating: 5,
                feedback: "Excellent service! Very detailed information and quick response."
            },
            {
                firstName: "Karim",
                lastName: "Farouk",
                email: "karim.farouk@outlook.com",
                phone: "+201222333444",
                userId: users[3]?._id || undefined,
                subject: "Complaint about Investment Performance",
                message: "I invested in a property 8 months ago and the returns have been significantly lower than projected. The property was supposed to generate 15% annual returns but I've only received 6% so far. This is very disappointing and not what was promised.",
                category: ContactCategory.COMPLAINT,
                status: ContactStatus.IN_PROGRESS,
                priority: ContactPriority.URGENT,
                assignedTo: admins[0]?._id || undefined,
                adminResponse: "I understand your concern and apologize for the disappointment. I've reviewed your investment and can see that the property has faced some unexpected maintenance issues that affected the rental income. Our property management team is working to resolve these issues. I'd like to schedule a call to discuss this in detail and explore possible solutions.",
                responseDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                ipAddress: "192.168.1.105",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                internalNotes: [
                    {
                        note: "Valid complaint. Property had unexpected HVAC repairs that affected rental income. Need to discuss compensation options.",
                        addedBy: admins[0]?._id || undefined,
                        addedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
                    }
                ],
                followUpRequired: true,
                followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Day after tomorrow
            },
            {
                firstName: "Layla",
                lastName: "Mansour",
                email: "layla.mansour@email.com",
                phone: "+201111222333",
                subject: "Suggestion for Platform Improvement",
                message: "I love using the Arkan platform! I have a suggestion: it would be great to have a feature that shows the environmental impact and sustainability ratings of properties. Many investors today care about ESG factors.",
                category: ContactCategory.SUGGESTION,
                status: ContactStatus.CLOSED,
                priority: ContactPriority.LOW,
                assignedTo: admins[1]?._id || undefined,
                adminResponse: "Thank you for this excellent suggestion! Sustainability and ESG factors are indeed becoming increasingly important to investors. I've forwarded your suggestion to our product development team. We're actually already working on incorporating sustainability ratings into our platform. Keep an eye out for updates!",
                responseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                resolvedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
                closedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                ipAddress: "192.168.1.106",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
                satisfactionRating: 4,
                feedback: "Great to see the team is already thinking about sustainability!"
            },
            {
                firstName: "Youssef",
                lastName: "Ibrahim",
                email: "youssef.ibrahim@company.com",
                phone: "+201999888777",
                subject: "General Inquiry About Investment Minimums",
                message: "Hello, I'm new to real estate investment and would like to know what the minimum investment amount is to get started on your platform. Also, are there any fees I should be aware of?",
                category: ContactCategory.GENERAL_INQUIRY,
                status: ContactStatus.NEW,
                priority: ContactPriority.MEDIUM,
                ipAddress: "192.168.1.107",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            {
                firstName: "Dina",
                lastName: "Salah",
                email: "dina.salah@gmail.com",
                phone: "+201777666555",
                userId: users[4]?._id || undefined,
                subject: "Payment Method Issue",
                message: "I'm trying to add a new credit card to my account but it keeps getting rejected. The card works fine for other online purchases. Could you please help me understand what might be causing this issue?",
                category: ContactCategory.TECHNICAL_SUPPORT,
                status: ContactStatus.NEW,
                priority: ContactPriority.MEDIUM,
                ipAddress: "192.168.1.108",
                userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15"
            }
        ];

        // Create contacts
        const createdContacts = [];
        for (const contactData of contacts) {
            const contact = new Contact(contactData);
            await contact.save();
            createdContacts.push(contact);
            console.log(`Created contact: ${contact.subject}`);
        }

        console.log("✅ Contact seeding completed successfully!");
        
        return {
            contactsCreated: createdContacts.length,
            statusBreakdown: {
                new: createdContacts.filter(c => c.status === ContactStatus.NEW).length,
                inProgress: createdContacts.filter(c => c.status === ContactStatus.IN_PROGRESS).length,
                resolved: createdContacts.filter(c => c.status === ContactStatus.RESOLVED).length,
                closed: createdContacts.filter(c => c.status === ContactStatus.CLOSED).length
            },
            priorityBreakdown: {
                low: createdContacts.filter(c => c.priority === ContactPriority.LOW).length,
                medium: createdContacts.filter(c => c.priority === ContactPriority.MEDIUM).length,
                high: createdContacts.filter(c => c.priority === ContactPriority.HIGH).length,
                urgent: createdContacts.filter(c => c.priority === ContactPriority.URGENT).length
            },
            categoryBreakdown: {
                generalInquiry: createdContacts.filter(c => c.category === ContactCategory.GENERAL_INQUIRY).length,
                technicalSupport: createdContacts.filter(c => c.category === ContactCategory.TECHNICAL_SUPPORT).length,
                investmentQuestion: createdContacts.filter(c => c.category === ContactCategory.INVESTMENT_QUESTION).length,
                accountIssue: createdContacts.filter(c => c.category === ContactCategory.ACCOUNT_ISSUE).length,
                propertyInquiry: createdContacts.filter(c => c.category === ContactCategory.PROPERTY_INQUIRY).length,
                complaint: createdContacts.filter(c => c.category === ContactCategory.COMPLAINT).length,
                suggestion: createdContacts.filter(c => c.category === ContactCategory.SUGGESTION).length,
                partnership: createdContacts.filter(c => c.category === ContactCategory.PARTNERSHIP).length
            },
            assignedContacts: createdContacts.filter(c => c.assignedTo).length,
            unassignedContacts: createdContacts.filter(c => !c.assignedTo).length
        };

    } catch (error) {
        console.error("❌ Error seeding contacts:", error);
        throw error;
    }
}
