import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://jayeetrab:mGhnfdMwFeFZwx6L@cohortconnect.lcpylgn.mongodb.net/")
client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client.cohortconnect

async def seed():
    print("Clearing existing jobs and alumni...")
    await db.jobs.drop()
    await db.alumni.drop()
    
    jobs = [
        # AI/ML & Data
        {"title": "Machine Learning Engineer", "company": "DeepMind", "description": "Building next-generation RL models. You should be comfortable with PyTorch, large scale training, and advanced calculus.", "required_skills": ["Python", "PyTorch", "Reinforcement Learning", "Deep Learning", "TensorFlow"], "location": "London, UK"},
        {"title": "AI Researcher (NLP)", "company": "OpenAI", "description": "Research on Transformer architectures and LLM prompt engineering.", "required_skills": ["Python", "Transformers", "NLP", "LLM", "HuggingFace", "LangChain"], "location": "Remote"},
        {"title": "Senior Data Scientist", "company": "JP Morgan", "description": "Predictive modeling for financial markets. Needs strong stats and big data capability.", "required_skills": ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "Scikit-learn"], "location": "London, UK"},
        {"title": "Data Engineer", "company": "Spotify", "description": "Building robust data pipelines to process terabytes of listener data via Kafka and Spark.", "required_skills": ["Python", "SQL", "Spark", "Kafka", "AWS", "Airflow"], "location": "Stockholm / Remote"},
        {"title": "Quantitative Analyst", "company": "Two Sigma", "description": "Alpha generation and algorithmic trading strategy development.", "required_skills": ["Python", "C++", "Statistics", "Quantitative Finance", "Machine Learning"], "location": "London, UK"},
        
        # Software Engineering (Backend/Fullstack)
        {"title": "Senior Backend Engineer", "company": "Stripe", "description": "Designing high-throughput API systems and managing distributed databases.", "required_skills": ["Go", "Python", "PostgreSQL", "Distributed Systems", "Kafka", "Microservices"], "location": "London, UK"},
        {"title": "Fullstack Software Engineer", "company": "Amazon", "description": "Working on scalable asynchronous systems with modern web frameworks.", "required_skills": ["React", "Node.js", "TypeScript", "AWS", "MongoDB"], "location": "Bristol, UK"},
        {"title": "Frontend Developer", "company": "Vercel", "description": "Creating beautiful, high-performance web applications using React and Next.js.", "required_skills": ["React", "Next.js", "Tailwind CSS", "TypeScript", "Framer Motion"], "location": "Remote"},
        {"title": "Java Backend Engineer", "company": "Barclays", "description": "Developing robust financial microservices.", "required_skills": ["Java", "Spring Boot", "Microservices", "SQL", "Kafka"], "location": "London, UK"},
        {"title": "Mobile App Developer", "company": "Monzo", "description": "Building seamless fintech experiences for iOS and Android.", "required_skills": ["React Native", "Swift", "Kotlin", "Mobile Development"], "location": "London, UK"},
        
        # Cloud, DevOps & Security
        {"title": "DevOps Engineer", "company": "GitLab", "description": "Setting up CI/CD pipelines, Kubernetes clusters, and monitoring systems.", "required_skills": ["Kubernetes", "Docker", "CI/CD", "AWS", "Terraform", "Linux"], "location": "Remote"},
        {"title": "Cloud Architect", "company": "AWS", "description": "Designing scalable cloud architectures for enterprise clients.", "required_skills": ["AWS", "System Design", "Cloud Architecture", "Terraform"], "location": "London, UK"},
        {"title": "Cybersecurity Analyst", "company": "Darktrace", "description": "Threat hunting, penetration testing, and security auditing.", "required_skills": ["Cybersecurity", "Network Security", "Python", "Penetration Testing"], "location": "Cambridge, UK"},
        {"title": "Site Reliability Engineer", "company": "Google", "description": "Ensuring Google services remain highly available and performant.", "required_skills": ["Go", "Python", "Kubernetes", "Linux", "System Design"], "location": "London, UK"},
        
        # Product & Design
        {"title": "Product Manager", "company": "Airbnb", "description": "Leading product strategy for host experiences.", "required_skills": ["Product Management", "Agile", "Data Analysis", "User Research", "Strategy"], "location": "Remote"},
        {"title": "UI/UX Designer", "company": "Figma", "description": "Designing intuitive interfaces and interactive prototypes.", "required_skills": ["Figma", "UI/UX Design", "Prototyping", "User Research"], "location": "London, UK"},
        {"title": "Technical Program Manager", "company": "Meta", "description": "Coordinating large scale engineering initiatives across multiple teams.", "required_skills": ["Program Management", "Agile", "Jira", "Cross-functional Leadership"], "location": "London, UK"},
        
        # Specialized/Other
        {"title": "Blockchain Developer", "company": "Coinbase", "description": "Writing smart contracts and building Web3 integrations.", "required_skills": ["Solidity", "Blockchain", "Web3", "Ethereum", "Cryptography"], "location": "Remote"},
        {"title": "Hardware Engineer", "company": "Tesla", "description": "Designing chip architecture for self-driving inference.", "required_skills": ["C", "C++", "Embedded Systems", "Verilog", "Hardware Design"], "location": "Bristol, UK"},
        {"title": "Game Developer", "company": "Epic Games", "description": "Building high-performance physics systems in Unreal Engine.", "required_skills": ["C++", "Unreal Engine", "Game Development", "3D Math"], "location": "Remote"}
    ]
    
    alumnis = [
        {"name": "Sarah Jenkins", "role": "Senior AI Architect", "company": "DeepMind", "graduation_year": 2018, "expertise": ["Machine Learning", "Transformers", "Python", "PyTorch"]},
        {"name": "James Chen", "role": "Backend Engineer", "company": "Amazon", "graduation_year": 2021, "expertise": ["AWS", "System Design", "Node.js", "MongoDB"]},
        {"name": "Sofia Martínez", "role": "Quantitative Analyst", "company": "Goldman Sachs", "graduation_year": 2022, "expertise": ["Risk Analysis", "Python", "R", "Statistics"]},
        {"name": "Elena Kowalski", "role": "Data Engineer", "company": "Spotify", "graduation_year": 2020, "expertise": ["Data Pipelines", "SQL", "Kafka", "Spark"]},
        {"name": "David Thorne", "role": "Frontend Lead", "company": "Vercel", "graduation_year": 2019, "expertise": ["React", "Next.js", "Tailwind CSS", "TypeScript"]},
        {"name": "Amelia Wong", "role": "Product Manager", "company": "Airbnb", "graduation_year": 2017, "expertise": ["Product Management", "Agile", "User Research"]},
        {"name": "Michael Stevens", "role": "Cybersecurity Specialist", "company": "Darktrace", "graduation_year": 2022, "expertise": ["Cybersecurity", "Network Security", "Penetration Testing"]},
        {"name": "Raj Patel", "role": "DevOps Engineer", "company": "GitLab", "graduation_year": 2021, "expertise": ["Kubernetes", "Docker", "CI/CD", "Terraform"]},
        {"name": "Lisa O'Connor", "role": "Blockchain Architect", "company": "Coinbase", "graduation_year": 2020, "expertise": ["Solidity", "Web3", "Cryptography"]},
        {"name": "Ahmed Al-Farsi", "role": "Cloud Architect", "company": "AWS", "graduation_year": 2018, "expertise": ["Cloud Architecture", "AWS", "System Design"]},
        {"name": "Emma Wright", "role": "UI/UX Designer", "company": "Figma", "graduation_year": 2023, "expertise": ["Figma", "UI/UX Design", "Prototyping"]},
        {"name": "Daniel Kim", "role": "Machine Learning Engineer", "company": "OpenAI", "graduation_year": 2021, "expertise": ["NLP", "LLM", "HuggingFace", "LangChain"]},
        {"name": "Sophia Rossi", "role": "Site Reliability Engineer", "company": "Google", "graduation_year": 2019, "expertise": ["Go", "Linux", "Kubernetes", "System Design"]},
        {"name": "Lucas Silva", "role": "Mobile Developer", "company": "Monzo", "graduation_year": 2022, "expertise": ["React Native", "Swift", "Kotlin"]},
        {"name": "William Davies", "role": "Hardware Engineer", "company": "Tesla", "graduation_year": 2020, "expertise": ["C", "C++", "Embedded Systems", "Hardware Design"]},
        {"name": "Chloe Bennett", "role": "Java Developer", "company": "Barclays", "graduation_year": 2023, "expertise": ["Java", "Spring Boot", "Microservices"]},
        {"name": "Alex Mercer", "role": "Game Developer", "company": "Epic Games", "graduation_year": 2021, "expertise": ["C++", "Unreal Engine", "Game Development"]},
        {"name": "Nadia Hassan", "role": "Technical Program Manager", "company": "Meta", "graduation_year": 2018, "expertise": ["Program Management", "Agile", "Cross-functional Leadership"]},
        {"name": "Oliver Twist", "role": "Data Scientist", "company": "JP Morgan", "graduation_year": 2022, "expertise": ["Python", "SQL", "Pandas", "Machine Learning"]},
        {"name": "Grace Hopper", "role": "Senior Backend Engineer", "company": "Stripe", "graduation_year": 2017, "expertise": ["Go", "PostgreSQL", "Distributed Systems"]}
    ]

    await db.jobs.insert_many(jobs)
    await db.alumni.insert_many(alumnis)
    print(f"Database seeded with {len(jobs)} jobs and {len(alumnis)} alumni profiles!")

if __name__ == "__main__":
    asyncio.run(seed())
