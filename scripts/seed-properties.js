const { seedProperties } = require('../lib/seedProperties.ts');

async function runSeed() {
    try {
        console.log('🌱 Starting property seeding...');
        
        const summary = await seedProperties();
        
        console.log('✅ Seeding completed successfully!');
        console.log('📊 Summary:', summary);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

runSeed();
