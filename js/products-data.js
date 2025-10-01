// 产品数据
const productsData = [
    {
        id: 'nova-finance',
        title: 'Nova Finance Platform',
        category: 'Fintech',
        description: 'A modern banking interface with advanced analytics and personalized insights.',
        image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        tags: ['Fintech', 'React', 'Node.js', 'Banking'],
        fullDescription: `
            <p>Nova Finance Platform is a modern banking interface that revolutionizes how users interact with their finances. By combining intuitive design with advanced financial technology, it provides a seamless experience for managing personal finances, investments, and banking services.</p>
            
            <h3>Intuitive and Minimalist User Interface</h3>
            <ul>
                <li><strong>1. Clean Dashboard:</strong> Overview of key financial metrics and recent activities</li>
                <li><strong>2. Smart Navigation:</strong> Context-aware menu system that adapts to user behavior</li>
                <li><strong>3. Visual Analytics:</strong> Interactive charts and graphs for financial data visualization</li>
                <li><strong>4. Financial Health Score:</strong> Comprehensive assessment of user's financial status with improvement suggestions</li>
            </ul>
            
            <h3>Advanced Financial Analysis Functions</h3>
            <ul>
                <li><strong>1. Real-time Expense Categorization and Tracking:</strong> Automatically categorize transactions and generate intuitive charts</li>
                <li><strong>2. Predictive Financial Models:</strong> Forecast future expenditures and saving trends based on consumption patterns</li>
                <li><strong>3. Contextual Comparative Analysis:</strong> Compare spending habits with peers, industry counterparts, or custom groups</li>
                <li><strong>4. Financial Health Score:</strong> Comprehensive assessment of user's financial status with improvement suggestions</li>
            </ul>
            
            <p>This modern banking interface represents the transformation of financial services from transaction processing to comprehensive financial advisory, empowering users through technology to make smarter financial decisions and achieve personal wealth goals.</p>
        `
    },
    {
        id: 'eco-habitat',
        title: 'Eco Habitat',
        category: 'Brand Identity',
        description: 'Complete brand identity for a sustainable housing initiative focused on eco-friendly living.',
        image: 'https://images.pexels.com/photos/2469122/pexels-photo-2469122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        tags: ['Branding', 'Logo Design', 'Sustainability'],
        fullDescription: `
            <p>Eco Habitat is a comprehensive brand identity project focused on sustainable housing initiatives. By combining eco-conscious design principles with community-focused messaging, it creates a powerful visual language that resonates with environmentally conscious consumers and promotes sustainable living practices.</p>
            
            <h3>Brand Design System</h3>
            <ul>
                <li><strong>1. Visual Identity:</strong> Eco-friendly color palette and typography</li>
                <li><strong>2. Logo Design:</strong> Sustainable and modern brand mark</li>
                <li><strong>3. Design Guidelines:</strong> Comprehensive brand style guide</li>
                <li><strong>4. Brand Collateral:</strong> Consistent application across all touchpoints</li>
            </ul>
            
            <h3>Material Guidelines</h3>
            <ul>
                <li><strong>1. Sustainable Materials:</strong> Eco-friendly printing and production options</li>
                <li><strong>2. Packaging Design:</strong> Minimal waste packaging solutions</li>
                <li><strong>3. Digital Assets:</strong> Optimized for various platforms</li>
                <li><strong>4. Brand Collateral:</strong> Consistent application across all touchpoints</li>
            </ul>
            
            <p>Eco Habitat's brand identity represents a commitment to sustainable living, creating a visual language that inspires and engages communities while promoting environmental consciousness.</p>
        `
    },
    {
        id: 'pulse-fitness',
        title: 'Pulse Fitness App',
        category: 'Mobile Development',
        description: 'Fitness tracking application with personalized workout plans and nutrition guidance.',
        image: 'https://images.pexels.com/photos/1103242/pexels-photo-1103242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        tags: ['React Native', 'Health Tech', 'UX Design'],
        fullDescription: `
            <p>Pulse Fitness App is a comprehensive mobile fitness solution that combines personalized workout tracking, nutrition guidance, and social features to create an engaging fitness experience. By leveraging mobile technology and data analytics, it provides users with a convenient and effective way to achieve their fitness goals.</p>
            
            <h3>Workout Management</h3>
            <ul>
                <li><strong>1. Custom Routines:</strong> Personalized workout plans and exercises</li>
                <li><strong>2. Exercise Library:</strong> Comprehensive database of workouts</li>
                <li><strong>3. Progress Tracking:</strong> Detailed performance monitoring</li>
                <li><strong>4. Workout Scheduling:</strong> Smart planning and reminders</li>
            </ul>
            
            <h3>Nutrition Tracking</h3>
            <ul>
                <li><strong>1. Meal Planning:</strong> Personalized nutrition guidance</li>
                <li><strong>2. Food Logging:</strong> Easy calorie and macro tracking</li>
                <li><strong>3. Recipe Database:</strong> Healthy meal suggestions</li>
                <li><strong>4. Hydration Monitoring:</strong> Water intake tracking</li>
            </ul>
            
            <p>Pulse Fitness App transforms the fitness experience by making it more accessible, engaging, and effective through innovative mobile technology and comprehensive tracking features.</p>
        `
    },
    {
        id: 'artisan-cafe',
        title: 'Artisan Café',
        category: 'Brand Identity',
        description: 'Brand identity and interior design for an upscale café chain focusing on craft coffee.',
        image: 'https://images.pexels.com/photos/302902/pexels-photo-302902.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        tags: ['Branding', 'Interior Design', 'Hospitality'],
        fullDescription: `
            <h3>Brand Identity System</h3>
            <ul>
                <li><strong>1. Logo System:</strong> Primary and secondary marks with versatile applications</li>
                <li><strong>2. Color Palette:</strong> Strategic color selection conveying brand personality</li>
                <li><strong>3. Typography Hierarchy:</strong> Distinctive and functional font families</li>
                <li><strong>4. Visual Language:</strong> Imagery style, iconography, and graphic elements</li>
            </ul>
            
            <h3>Brand Expression Guidelines</h3>
            <ul>
                <li><strong>1. Brand Voice:</strong> Tone, personality, and communication principles</li>
                <li><strong>2. Implementation Standards:</strong> Consistent application across all touchpoints</li>
                <li><strong>3. Digital Experience:</strong> UI/UX guidelines for digital platforms</li>
                <li><strong>4. Brand Evolution:</strong> Framework for growth while maintaining recognition</li>
            </ul>
            
            <p>A successful Brand Identity serves as the foundation for all brand interactions, creating emotional connections with audiences while establishing trust and recognition that drives business value and fosters lasting customer relationships.</p>
        `
    },
    {
        id: 'nomad-travel',
        title: 'Nomad Travel Platform',
        category: 'Web Development',
        description: 'Travel booking platform catering to digital nomads with unique accommodation options.',
        image: 'https://images.pexels.com/photos/7625308/pexels-photo-7625308.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        tags: ['Next.js', 'Travel Tech', 'UI Design'],
        fullDescription: `
            <h3>Travel Planning & Discovery</h3>
            <ul>
                <li><strong>1. Destination Intelligence:</strong> Climate, cost of living, and visa requirement analytics</li>
                <li><strong>2. Workspace Finder:</strong> Curated coworking spaces with connectivity ratings</li>
                <li><strong>3. Accommodation Matchmaking:</strong> Nomad-friendly housing with flexible terms</li>
                <li><strong>4. Travel Logistics:</strong> Integrated transportation and relocation planning</li>
            </ul>
            
            <h3>Community & Lifestyle Support</h3>
            <ul>
                <li><strong>1. Nomad Networking:</strong> Location-based community connections and events</li>
                <li><strong>2. Knowledge Exchange:</strong> Destination guides and local insights</li>
                <li><strong>3. Remote Work Resources:</strong> Time zone management and productivity tools</li>
                <li><strong>4. Wellbeing Services:</strong> Health resources and work-life balance support</li>
            </ul>
            
            <p>The Nomad Travel Platform serves as a comprehensive companion for the modern location-independent lifestyle, bridging the gap between travel aspirations and practical realities while fostering a global community of like-minded professionals seeking freedom, growth, and authentic experiences.</p>
        `
    },
    {
        id: 'summit-events',
        title: 'Summit Events',
        category: 'Digital Marketing',
        description: 'Digital campaign for a technology conference with interactive landing pages and social media strategy.',
        image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        tags: ['Digital Marketing', 'Event', 'Web Design'],
        fullDescription: `
            <h3>Strategic Marketing Framework</h3>
            <ul>
                <li><strong>1. Audience Intelligence:</strong> Behavioral analysis and segmentation methodologies</li>
                <li><strong>2. Channel Optimization:</strong> Cross-platform strategy and budget allocation</li>
                <li><strong>3. Content Ecosystem:</strong> Integrated storytelling and content journey mapping</li>
                <li><strong>4. Performance Analytics:</strong> ROI measurement and attribution modeling</li>
            </ul>
            
            <h3>Tactical Implementation Elements</h3>
            <ul>
                <li><strong>1. Search Marketing:</strong> SEO fundamentals and paid search campaign management</li>
                <li><strong>2. Social Media Engagement:</strong> Platform-specific strategies and community building</li>
                <li><strong>3. Conversion Optimization:</strong> Landing page design and funnel analysis</li>
                <li><strong>4. Marketing Automation:</strong> Personalized customer journeys and nurture workflows</li>
            </ul>
            
            <p>Effective Digital Marketing transcends individual tactics to create cohesive brand experiences across the customer lifecycle, combining creativity with analytical precision to generate measurable business outcomes while adapting to rapidly evolving technologies and consumer behaviors in the digital landscape.</p>
        `
    }
];

// 获取所有类别
function getCategories() {
    const categories = new Set();
    productsData.forEach(product => categories.add(product.category));
    return ['All', ...Array.from(categories)];
}

// 根据类别过滤产品
function filterProductsByCategory(category) {
    if (category === 'All') {
        return productsData;
    }
    return productsData.filter(product => product.category === category);
}

// 根据 ID 获取产品
function getProductById(id) {
    return productsData.find(product => product.id === id);
}

