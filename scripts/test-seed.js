// Simple test script to verify seeded data
const mongoose = require('mongoose');

// Import models (you'll need to compile TypeScript first or use ts-node)
async function testSeedData() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arkan');
        
        console.log('🔗 Connected to database');
        
        // Import models
        const { Property } = require('../models/Property');
        const { Investment } = require('../models/Investment');
        const { User } = require('../models/User');
        
        // Test property counts
        const propertyStats = await Property.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        
        console.log('📊 Property Statistics:');
        propertyStats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} properties`);
        });
        
        // Test investment counts
        const investmentStats = await Investment.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        console.log('💰 Investment Statistics:');
        investmentStats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} investments`);
        });
        
        // Test user counts
        const userCount = await User.countDocuments({ status: 'active' });
        console.log(`👥 Active Users: ${userCount}`);
        
        // Test featured properties
        const featuredProperties = await Property.find({ 
            isFeatured: true, 
            isActive: true 
        }).select('name type');
        
        console.log('⭐ Featured Properties:');
        featuredProperties.forEach(prop => {
            console.log(`  ${prop.name} (${prop.type})`);
        });
        
        // Test available properties
        const availableProperties = await Property.find({ 
            status: 'Available', 
            isActive: true,
            availableShares: { $gt: 0 }
        }).select('name availableShares totalShares');
        
        console.log('🏠 Available Properties:');
        availableProperties.forEach(prop => {
            const fundingPercentage = ((prop.totalShares - prop.availableShares) / prop.totalShares * 100).toFixed(1);
            console.log(`  ${prop.name}: ${prop.availableShares}/${prop.totalShares} shares (${fundingPercentage}% funded)`);
        });
        
        console.log('✅ Seed data verification completed!');
        
    } catch (error) {
        console.error('❌ Error testing seed data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

testSeedData();
