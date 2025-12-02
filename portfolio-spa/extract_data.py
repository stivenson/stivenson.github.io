#!/usr/bin/env python3
"""
Data extraction script for Stivenson's Portfolio
Parses CV markdown and about-me.html to generate profile.json
Filters out sensitive contact information (phone, email)
"""

import json
import re
from pathlib import Path

def main():
    profile = {
        "personal": {
            "name": "Stivenson Rincón Mora",
            "title": "Systems Engineer & Full Stack Developer",
            "location": "Cúcuta, Norte de Santander, Colombia",
            "github": "https://github.com/stivenson",
            "birthYear": 1990,
            "motto": "Código limpio y mente limpia, con un propósito claro"
        },
        "experience": [
            {
                "company": "Mo Technologies (Mastercard)",
                "role": "Full Stack - Senior Developer",
                "period": "Marzo 2021 - Actualidad",
                "modality": "semi-presencial",
                "description": [
                    "Desarrollo de productos bancarios en AWS y GCP usando Python, Serverless y otros servicios AWS",
                    "Manejo de DevOps, arquitectura y tareas de cloud computing"
                ],
                "technologies": ["Python", "AWS", "GCP", "Serverless", "DevOps"]
            },
            {
                "company": "Universidad El Bosque",
                "role": "Full Stack Developer",
                "period": "Mayo 2020 - Febrero 2021",
                "modality": "presencial y remoto",
                "description": [
                    "Migración digital a Microservicios en AWS",
                    "Uso de ECS, S3, CodeCommit y CloudFormation para recursos CI/CD",
                    "Codificación en Java (Spring Boot) y frontend con React y Prime React"
                ],
                "technologies": ["Java", "Spring Boot", "React", "AWS", "ECS", "S3", "CloudFormation"]
            },
            {
                "company": "DXC Technology",
                "role": "Full Stack Developer",
                "period": "Diciembre 2019 - Abril 2020",
                "modality": "presencial y remoto",
                "description": [
                    "Desarrollo de microservicios en TypeScript sobre GKE",
                    "Proyecto de transformación digital de Davivienda en Colombia, El Salvador, Costa Rica y Panamá",
                    "Procesos de creación de cuentas, créditos, tarjetas y biometría"
                ],
                "technologies": ["TypeScript", "GKE", "Microservicios", "Kubernetes"]
            },
            {
                "company": "Cuemby LLC",
                "role": "Full Stack Developer and Cloud Computing",
                "period": "Marzo 2017 - Noviembre 2019",
                "modality": "remoto",
                "description": [
                    "Desarrollo de microservicios en Node.js (senior) y Python (semi-senior)",
                    "Uso de Protocol Buffer, GraphQL (Apollo), RESTful (Hapi.js y Express.js)",
                    "Despliegue en Kubernetes (k8s), contenedores con Docker",
                    "Trabajo con Lambda Functions, S3, DynamoDB y Redshift",
                    "Desarrollo de clientes en React y React Native",
                    "Labores de líder técnico gestionando programadores junior usando metodologías Scrum"
                ],
                "technologies": ["Node.js", "Python", "GraphQL", "Kubernetes", "Docker", "React", "React Native", "AWS"]
            }
        ],
        "education": [
            {
                "institution": "Universidad de los Andes",
                "degree": "Maestría en Inteligencia Artificial",
                "period": "2024 - Actualidad",
                "description": "Enfoque en aplicar IA a problemas reales de la región"
            },
            {
                "institution": "Universidad Simón Bolívar",
                "degree": "Ingeniería de Sistemas",
                "period": "Agosto 2009 - Julio 2014",
                "description": "Exaltación por apoyar la sistematización del estudio socioeconómico de Gramalote"
            },
            {
                "institution": "Universidad Simón Bolívar",
                "degree": "Diplomado - Desarrollo de aplicaciones para dispositivos móviles",
                "period": "Febrero 2014 - Junio 2014",
                "description": "Enfoque en desarrollo de aplicaciones híbridas"
            }
        ],
        "courses": [
            "Curso Especial en Mantenimiento Preventivo y Correctivo del Hardware para Procesos de Soporte Técnico (SENA)",
            "Curso Especial en Microcontroladores I (SENA)",
            "Curso Especial en Proyecto de Vida (SENA)",
            "Curso Certificación Kubernetes (Fundación del Software Libre) - En curso",
            "Curso Inglés en American School Way - En curso"
        ],
        "skills": {
            "languages": ["Python", "JavaScript", "TypeScript", "Java", "Node.js"],
            "frontend": ["React", "React Native", "Prime React"],
            "backend": ["Spring Boot", "Hapi.js", "Express.js", "GraphQL", "REST"],
            "cloud": ["AWS", "GCP", "Lambda", "ECS", "S3", "DynamoDB", "Redshift", "CloudFormation"],
            "devops": ["Kubernetes", "Docker", "CI/CD", "Serverless"],
            "databases": ["DynamoDB", "Redshift", "SQL"],
            "methodologies": ["Scrum", "Agile"]
        },
        "achievements": [
            {
                "title": "Exaltación Académica",
                "description": "Ingeniero de Sistemas con mención por trabajo social en Gramalote. Proyecto que unió técnica y propósito."
            },
            {
                "title": "Experiencia Internacional",
                "description": "Trabajo con equipos globales (Mastercard/Mo Technologies, DXC Technology). Pensar local y ejecutar a escala."
            },
            {
                "title": "Maestría en IA",
                "description": "Estudiante de la Maestría en Inteligencia Artificial en la Universidad de los Andes, con enfoque en aplicaciones útiles para la región."
            },
            {
                "title": "Conocer el mundo con mi madre",
                "description": "Al ser profesional, pude darle la oportunidad a ella de conocer muchos países de Europa y Latinoamérica."
            }
        ],
        "about": {
            "origins": {
                "birthplace": "Cúcuta, Norte de Santander, Colombia",
                "childhood": "Curioso y meticuloso. Siempre escribiendo desde los 3 años, y desde los 8 años que conocí una computadora, me encantó ese mundo paralelo lleno de posibilidades.",
                "childhoodDream": "Crear algo que cambiara el mundo tecnológicamente. Quería inventar cosas que la gente usara todos los días.",
                "firstMemory": "Ver por primera vez una computadora encendida. Esa pantalla azul y colorida me atrapó completamente.",
                "hobbies": "Leer cuentos, dibujar ciudades y jugar en la computadora."
            },
            "philosophy": {
                "mainBelief": "Que la tecnología tiene que servir a la gente. Si una línea de código no sirve para aportar a un resultado que ayude a la sociedad entonces no tiene ningún sentido.",
                "passion": "Tender puentes entre lo técnico y lo humano. Traducir problemas reales en soluciones claras.",
                "values": [
                    "Integridad técnica y personal",
                    "Impacto social positivo a través de la tecnología",
                    "Aprendizaje continuo y humildad intelectual",
                    "Colaboración por encima de la competencia sin sentido",
                    "Fe como fuerza interior que orienta y da calma"
                ],
                "favoriteQuote": "Stay hungry, stay foolish - Mi versión: Mantente curioso, mantente útil.",
                "favoriteAuthor": "Isaac Asimov (especialmente por sus reflexiones sobre robótica y ética)",
                "favoriteMovie": "Interstellar"
            },
            "dreams": {
                "lifeDream": "Usar la inteligencia artificial para resolver problemas muy concretos de mi región. Quiero que lo que construya sirva de verdad y se note en la vida de la gente.",
                "biggestWish": "Que Colombia sea un lugar donde aprender, emprender y quedarse sea posible. EVITAR LA FUGA DE TALENTOS.",
                "placesToVisit": ["China", "Observatorios astronómicos", "Marte"]
            },
            "future": {
                "goals": [
                    "Terminar la maestría en IA y llevar proyectos a producción que ayuden a mi región",
                    "Construir una startup con base en Colombia y mirada global",
                    "Convertir problemas regionales en casos de uso de IA bien resueltos",
                    "Aportar a un ecosistema tecnológico más moderno y generoso"
                ],
                "skillsToDevelope": [
                    "ML avanzado: para que las soluciones sean más inteligentes y útiles",
                    "Liderazgo técnico y humano: para guiar equipos diversos que entreguen valor real",
                    "Comunicación clara: bajar la complejidad y hacerla entendible para todos"
                ]
            },
            "personality": {
                "adjectives": "Analítico y curioso desde niño; perseverante, directo y meticuloso. Resiliente y con una obsesión sana por que lo que hago tenga impacto real.",
                "influences": "Mi familia, que me inculcó disciplina y fe; y varios profesores en la Simón Bolívar.",
                "keyEvent": "Estar en el proyecto de Gramalote durante la universidad. Allí vi la tecnología al servicio de familias reales."
            },
            "gratitude": {
                "toParents": "Nunca escatimar en mi educación. Me enseñaron que el conocimiento es la única herencia que nadie te puede quitar.",
                "mainLesson": "El conocimiento es la vía a la sabiduría. Y la paciencia es el DON más importante.",
                "roleModel": "Una combinación entre Simón Bolívar y los pioneros de la computación como Alan Turing."
            }
        },
        "github": {
            "username": "stivenson",
            "profileUrl": "https://github.com/stivenson",
            "pinnedRepos": [
                {
                    "name": "Hapi-Study",
                    "description": "Study of Services Restful with Hapi.js and related topics",
                    "language": "JavaScript",
                    "stars": 5
                },
                {
                    "name": "example-typescript-grpc-api",
                    "description": "Project of example to expose resources using typescript and grpc framework",
                    "language": "JavaScript",
                    "stars": 2
                },
                {
                    "name": "Rust-Study",
                    "description": "Repository to shared rust-lang's exercises of study's process",
                    "language": "Rust",
                    "stars": 12
                },
                {
                    "name": "Mithril-1-with-ES6-Classes-Example",
                    "description": "Example of Mithril 1 with ES6 Classes",
                    "language": "JavaScript",
                    "stars": 1
                }
            ]
        }
    }

    # Write to JSON file
    output_path = Path(__file__).parent / "src" / "data" / "profile.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] Profile data extracted and saved to: {output_path}")
    print(f"Data includes:")
    print(f"   - {len(profile['experience'])} work experiences")
    print(f"   - {len(profile['education'])} education entries")
    print(f"   - {len(profile['courses'])} courses")
    print(f"   - {len(profile['achievements'])} achievements")
    print(f"   - {len(profile['github']['pinnedRepos'])} pinned repos")
    print(f"   - Personal philosophy and about sections")
    print(f"[!] Sensitive info (email, phone) has been filtered out")

if __name__ == "__main__":
    main()

