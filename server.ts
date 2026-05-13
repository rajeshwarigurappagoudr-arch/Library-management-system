import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database setup
  const db = new Database("library.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT,
      isbn TEXT,
      status TEXT DEFAULT 'Available',
      cover_image TEXT,
      description TEXT,
      price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      class TEXT NOT NULL,
      entry_time TEXT NOT NULL,
      exit_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed data if empty
  const rowCount = db.prepare("SELECT COUNT(*) as count FROM books").get() as { count: number };
  if (rowCount.count === 0) {
    const insert = db.prepare("INSERT INTO books (title, author, category, status, cover_image, description, price) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    // Psychologist
    const psychologistBooks = [
      ["The Psychology of Money", "Morgan Housel", "Psychologist", "Available", "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000", "Timeless lessons on wealth, greed, and happiness.", 750],
      ["Thinking, Fast and Slow", "Daniel Kahneman", "Psychologist", "Available", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000", "Explores the two systems that drive the way we think.", 1120],
      ["Man's Search for Meaning", "Viktor Frankl", "Psychologist", "Available", "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1000", "A psychiatrist's memoir on survival and finding light.", 640],
      ["The Body Keeps the Score", "Bessel van der Kolk", "Psychologist", "Available", "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000", "Brain, mind, and body in the healing of trauma.", 850],
      ["Influence: The Psychology of Persuasion", "Robert Cialdini", "Psychologist", "Available", "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000", "The classic book on persuasion.", 720],
      ["Flow", "Mihaly Csikszentmihalyi", "Psychologist", "Available", "https://images.unsplash.com/photo-1491843351663-7c1c62820cbe?q=80&w=1000", "The psychology of optimal experience.", 680],
      ["Daring Greatly", "Brené Brown", "Psychologist", "Available", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000", "How the courage to be vulnerable transforms the way we live.", 710],
      ["Grit", "Angela Duckworth", "Psychologist", "Available", "https://images.unsplash.com/photo-1526243128144-6254af97273a?q=80&w=1000", "The power of passion and perseverance.", 740]
    ];

    // Business Minds
    const businessBooks = [
      ["Zero to One", "Peter Thiel", "Business Minds", "Available", "/src/assets/images/regenerated_image_1778648082805.jpg", "Notes on Startups, or How to Build the Future.", 890],
      ["The Lean Startup", "Eric Ries", "Business Minds", "Available", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000", "How today's entrepreneurs use continuous innovation.", 950],
      ["Shoe Dog", "Phil Knight", "Business Minds", "Available", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000", "A memoir by the creator of Nike.", 880],
      ["Hard Things About Hard Things", "Ben Horowitz", "Business Minds", "Available", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000", "Building a business when there are no easy answers.", 920],
      ["The innovator's Dilemma", "Clayton Christensen", "Business Minds", "Available", "https://images.unsplash.com/photo-1454165833767-027eeef1596e?q=80&w=1000", "The revolutionary book that will change the way you do business.", 1050],
      ["Good to Great", "Jim Collins", "Business Minds", "Available", "https://images.unsplash.com/photo-1444653300346-6419bc303b30?q=80&w=1000", "Why some companies make the leap and others don't.", 980],
      ["Principles", "Ray Dalio", "Business Minds", "Available", "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000", "Life and work principles from a legendary investor.", 1200]
    ];

    // Tech Brain
    const techBooks = [
      ["Clean Code", "Robert C. Martin", "Tech Brain", "Available", "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000", "A Handbook of Agile Software Craftsmanship.", 1200],
      ["The Pragmatic Programmer", "Andrew Hunt", "Tech Brain", "Available", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000", "Your journey to mastery in software development.", 1350],
      ["Design Patterns", "Erich Gamma", "Tech Brain", "Available", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000", "Elements of Reusable Object-Oriented Software.", 1580],
      ["JavaScript: The Good Parts", "Douglas Crockford", "Tech Brain", "Available", "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1000", "Unearthing the excellence in JavaScript.", 850],
      ["You Don't Know JS", "Kyle Simpson", "Tech Brain", "Available", "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=1000", "Dive deep into the core mechanics of Javascript.", 780],
      ["Refactoring", "Martin Fowler", "Tech Brain", "Available", "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1000", "Improving the design of existing code.", 1450],
      ["Cracking the Coding Interview", "Gayle Laakmann McDowell", "Tech Brain", "Available", "https://images.unsplash.com/photo-1484417824246-195f56702174?q=80&w=1000", "189 Programming Questions and Solutions.", 1100]
    ];

    // Quotes & Philoshophy
    const quoteBooks = [
      ["Meditation Quotes", "Marcus Aurelius", "Quotes", "Available", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000", "A collection of thoughts from the Roman Emperor.", 350],
      ["Daily Stoic", "Ryan Holiday", "Quotes", "Available", "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000", "366 Meditations on Wisdom.", 599],
      ["Letters from a Stoic", "Seneca", "Quotes", "Available", "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=1000", "Timeless advice on overcoming grief and hardship.", 480],
      ["Tao Te Ching", "Lao Tzu", "Quotes", "Available", "https://images.unsplash.com/photo-1474366521946-c3d4b507ad9a?q=80&w=1000", "Ancient wisdom for modern life.", 420],
      ["Beyond Good and Evil", "Friedrich Nietzsche", "Quotes", "Available", "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=1000", "Prelude to a Philosophy of the Future.", 650],
      ["The Art of War", "Sun Tzu", "Quotes", "Available", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000", "Strategic wisdom for every conflict.", 450],
      ["Walden", "Henry David Thoreau", "Quotes", "Available", "https://images.unsplash.com/photo-1447069387533-912f200c8f53?q=80&w=1000", "Reflection upon simple living in natural surroundings.", 520]
    ];

    // Engineering
    const engineeringBooks = [
      ["The Bridge on the Hills", "James V. Watson", "Engineering", "Available", "/src/assets/images/regenerated_image_1778648083814.jpg", "A deep dive into civil engineering marvels.", 1250],
      ["Structural Analysis", "Hibbeler", "Engineering", "Available", "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1000", "Theory and application of structural analysis.", 1850],
      ["Fluid Mechanics", "White", "Engineering", "Available", "https://images.unsplash.com/photo-1503387762-592dec583201?q=80&w=1000", "Comprehensive coverage of fluid dynamics.", 1620],
      ["Mechanical Vibrations", "Rao", "Engineering", "Available", "https://images.unsplash.com/photo-1534398079543-7ae6d01bd3f5?q=80&w=1000", "Study of oscillatory motions and engineering systems.", 1740],
      ["Control Systems Engineering", "Nise", "Engineering", "Available", "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000", "Feedback control systems design and analysis.", 1590],
      ["Introduction to Robotics", "Craig", "Engineering", "Available", "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000", "Mechanics and control of robotic systems.", 1950],
      ["Thermodynamics", "Cengel", "Engineering", "Available", "https://images.unsplash.com/photo-1532187875605-1ef900c1f5e9?q=80&w=1000", "An engineering approach to energy and heat.", 1480]
    ];

    // Medical
    const medicalBooks = [
      ["Gray's Anatomy", "Henry Gray", "Medical", "Available", "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1000", "The classic descriptive and surgical anatomy.", 2500],
      ["Harrison's Principles of Internal Medicine", "Fauci", "Medical", "Available", "https://images.unsplash.com/photo-1576091160550-217359f49f4c?q=80&w=1000", "The gold standard for medical education.", 2200],
      ["Robbins Basic Pathology", "Kumar", "Medical", "Available", "https://images.unsplash.com/photo-1579154235602-3c2cfa99e16d?q=80&w=1000", "A clear and concise introduction to pathology.", 1850],
      ["Guyton and Hall Textbook of Medical Physiology", "Hall", "Medical", "Available", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000", "Fundamental concepts in medical physiology.", 1920],
      ["Oxford Handbook of Clinical Medicine", "Wilkinson", "Medical", "Available", "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1000", "A concise guide to all areas of clinical medicine.", 1450],
      ["Nelson Textbook of Pediatrics", "Kliegman", "Medical", "Available", "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?q=80&w=1000", "The reference for pediatric healthcare.", 2100],
      ["Macleod's Clinical Examination", "Douglas", "Medical", "Available", "https://images.unsplash.com/photo-1576089172869-4f5f6f315620?q=80&w=1000", "Skills required for clinical examination.", 1320]
    ];

    // TECHNOLOGY/OTHER
    const techOther = [
      ["DARK LIFE", "Elena Rodriguez", "Technology", "Available", "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000", "Official archive unit for the KLE Society Library.", 899.99],
      ["Science of Data", "Sarah Mitchell", "Technology", "Available", "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1000", "Mastering metadata architecture.", 1499.00]
    ];

    [...psychologistBooks, ...businessBooks, ...techBooks, ...quoteBooks, ...engineeringBooks, ...medicalBooks, ...techOther].forEach(book => {
      insert.run(book[0], book[1], book[2], book[3], book[4], book[5], book[6]);
    });
  }

  // Seed registrations if empty
  const regCount = db.prepare("SELECT COUNT(*) as count FROM registrations").get() as { count: number };
  if (regCount.count === 0) {
    const insertReg = db.prepare("INSERT INTO registrations (student_name, class, entry_time, exit_time) VALUES (?, ?, ?, ?)");
    insertReg.run("Rahul Sharma", "BCA III Sem", "09:30 AM", "11:45 AM");
    insertReg.run("Priya Patil", "BCA V Sem", "10:15 AM", "01:30 PM");
    insertReg.run("Amit Kumar", "BCA I Sem", "11:00 AM", null);
    insertReg.run("Sneha Hegde", "BCA III Sem", "11:20 AM", null);
  }

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/books", (req, res) => {
    try {
      const books = db.prepare("SELECT * FROM books ORDER BY created_at DESC").all();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  app.get("/api/registrations", (req, res) => {
    try {
      const regs = db.prepare("SELECT * FROM registrations ORDER BY created_at DESC").all();
      res.json(regs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  app.post("/api/registrations", (req, res) => {
    const { student_name, class: studentClass, entry_time } = req.body;
    try {
      const info = db.prepare("INSERT INTO registrations (student_name, class, entry_time) VALUES (?, ?, ?)")
        .run(student_name, studentClass, entry_time);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to register visitor" });
    }
  });

  app.put("/api/registrations/:id/exit", (req, res) => {
    const { id } = req.params;
    const { exit_time } = req.body;
    try {
      db.prepare("UPDATE registrations SET exit_time = ? WHERE id = ?")
        .run(exit_time, id);
      res.json({ message: "Exit time updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update exit time" });
    }
  });

  app.post("/api/books", (req, res) => {
    const { title, author, category, status, cover_image, description } = req.body;
    try {
      const info = db.prepare("INSERT INTO books (title, author, category, status, cover_image, description) VALUES (?, ?, ?, ?, ?, ?)")
        .run(title, author, category, status || 'Available', cover_image, description);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add book" });
    }
  });

  app.put("/api/books/:id", (req, res) => {
    const { id } = req.params;
    const { title, author, category, status, cover_image, description } = req.body;
    try {
      db.prepare("UPDATE books SET title = ?, author = ?, category = ?, status = ?, cover_image = ?, description = ? WHERE id = ?")
        .run(title, author, category, status, cover_image, description, id);
      res.json({ message: "Book updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM books WHERE id = ?").run(id);
      res.json({ message: "Book deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
