flowchart TD
    %% Define Styles
    classDef frontend fill:#dd0031,stroke:#fff,stroke-width:2px,color:#fff;
    classDef backend fill:#6db33f,stroke:#fff,stroke-width:2px,color:#fff;
    classDef database fill:#336791,stroke:#fff,stroke-width:2px,color:#fff;
    classDef cache fill:#dc382d,stroke:#fff,stroke-width:2px,color:#fff;
    classDef external fill:#f2a900,stroke:#fff,stroke-width:2px,color:#fff;
    classDef security fill:#000000,stroke:#fff,stroke-width:2px,color:#fff;

    %% External Systems & Users
    User([👨‍💻 Accountant / CFO]) -->|CMD+K / Tally Keys| UI
    HMS([🏥 Healthcare HMS]) -->|HL7 / FHIR| Gateway
    DMS([🚗 Auto DMS]) -->|JSON / API| Gateway
    Bank([🏦 Open Banking / Market APIs]) -->|ISO 20022| Gateway

    %% Frontend Layer
    subgraph Client_Layer [Frontend UI Layer]
        UI[Angular 19+ App \n (Signals State)]:::frontend
        UI_Mobile[Flutter Native App \n (Future)]:::frontend
    end
    UI -->|REST / GraphQL| API_Gateway

    %% Backend Layer (Java Spring Boot)
    subgraph Application_Layer [Java Spring Boot 3.4+ Backend]
        API_Gateway[API Gateway / Router]:::backend
        Gateway -->|Universal Ingestion| Mapper[Universal Mapper \n (JSONB Tagging)]:::backend
        API_Gateway --> CoreEngine
        Mapper --> CoreEngine
        
        CoreEngine[Double-Entry Ledger Engine \n (Virtual Threads)]:::backend
        AIEngine[AI Forecasting & OCR Engine]:::backend
        CoreEngine <--> AIEngine
        
        %% Security & Encryption Barrier
        SecurityService{CSFLE Encryption Engine \n AES-256-GCM}:::security
        CoreEngine -->|Raw Financial Data| SecurityService
    end

    %% Data & Cache Layer
    subgraph Data_Layer [High-Performance Data Storage]
        Redis[(Redis 7+ \n Warm Cache)]:::cache
        Postgres[(PostgreSQL 17+ \n Encrypted Ledger + RLS)]:::database
        S3[(AWS S3 / MinIO \n Document Vault)]:::database
    end

    %% Data Flows
    SecurityService -->|Decrypt on Login| Redis
    CoreEngine <-->|Fetch Active Session| Redis
    SecurityService -->|Write Encrypted Blobs \n & Blind Indexes| Postgres
    CoreEngine -->|Save Invoices/Receipts| S3
