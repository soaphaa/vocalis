/**
 * ============================================
 * ACCESSTALK - DATABASE MODULE (db.js)
 * ============================================
 * 
 * WHAT IS A DATABASE?
 * A database is a place to store information permanently.
 * Without a database, when you refresh the page, everything is lost.
 * 
 * WHAT IS INDEXEDDB?
 * IndexedDB is a database that runs IN THE BROWSER
 * - No server needed
 * - Data stays on user's computer
 * - Can store hundreds of MB
 * - Perfect for storing transcription history
 * 
 * ANALOGY:
 * If localStorage is like a notepad (small, simple)
 * Then IndexedDB is like a filing cabinet (bigger, organized)
 */

// ========== CONFIGURATION ==========
const DB_NAME = 'AccessTalkDB';          // Name of our database
const DB_VERSION = 1;                     // Version (increment when schema changes)
const STORE_NAME = 'sessions';            // Name of our storage "table"

// ========== DATABASE OBJECT ==========
const db = {
    instance: null,  // Will hold reference to actual database
    
    /**
     * Initialize (open) the database
     * 
     * WHAT HAPPENS:
     * 1. Requests IndexedDB to open a database
     * 2. If it doesn't exist, creates it
     * 3. Sets up the structure (schema)
     * 4. Stores reference to database for later use
     */
    async init() {
        return new Promise((resolve, reject) => {
            // indexedDB.open() = "open the database for me"
            // If it doesn't exist, it creates it
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            // If we need to upgrade the database structure
            request.onupgradeneeded = (event) => {
                console.log('📊 Setting up IndexedDB schema...');
                
                const database = event.target.result;
                
                // Create an object store (like a table in a spreadsheet)
                // keyPath: 'id' = each session has a unique ID
                // autoIncrement: true = automatically assign IDs (1, 2, 3...)
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    const store = database.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    
                    // Create indexes for fast searching
                    // An index is like a sorted list for quick lookups
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('language', 'language', { unique: false });
                    
                    console.log('✅ Database schema created');
                }
            };
            
            // If database opens successfully
            request.onsuccess = () => {
                db.instance = request.result;
                console.log('✅ Database opened successfully');
                resolve(db.instance);
            };
            
            // If error occurs
            request.onerror = () => {
                console.error('❌ Failed to open database:', request.error);
                reject(request.error);
            };
        });
    },
    
    /**
     * Add a new session to the database
     * 
     * WHAT THIS DOES:
     * Takes a session object (with text, timestamp, etc.)
     * and stores it permanently in IndexedDB
     */
    async addSession(sessionData) {
        // Make sure database is initialized
        if (!db.instance) {
            await db.init();
        }
        
        return new Promise((resolve, reject) => {
            // Create a transaction
            // TRANSACTION = a "safe" operation on the database
            // 'readwrite' = we want to WRITE data
            const transaction = db.instance.transaction([STORE_NAME], 'readwrite');
            
            // Get reference to the object store (table)
            const store = transaction.objectStore(STORE_NAME);
            
            // Add the data to the store
            const request = store.add(sessionData);
            
            request.onsuccess = () => {
                console.log(`✅ Session added with ID: ${request.result}`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('❌ Failed to add session:', request.error);
                reject(request.error);
            };
        });
    },
    
    /**
     * Get all sessions from database
     * 
     * WHAT THIS DOES:
     * Retrieves ALL sessions stored in the database
     * Returns them as an array
     */
    async getAllSessions() {
        if (!db.instance) {
            await db.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = db.instance.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            
            // getAll() = "give me all records"
            const request = store.getAll();
            
            request.onsuccess = () => {
                const sessions = request.result;
                console.log(`📊 Retrieved ${sessions.length} sessions from database`);
                resolve(sessions);
            };
            
            request.onerror = () => {
                console.error('❌ Failed to get sessions:', request.error);
                reject(request.error);
            };
        });
    },
    
    /**
     * Get a single session by ID
     * 
     * WHAT THIS DOES:
     * Finds and returns one specific session
     */
    async getSession(id) {
        if (!db.instance) {
            await db.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = db.instance.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            
            // get(id) = "give me the record with this ID"
            const request = store.get(id);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    },
    
    /**
     * Delete a session by ID
     * 
     * WHAT THIS DOES:
     * Removes a specific session from the database
     */
    async deleteSession(id) {
        if (!db.instance) {
            await db.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = db.instance.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // delete(id) = "remove the record with this ID"
            const request = store.delete(id);
            
            request.onsuccess = () => {
                console.log(`✅ Session ${id} deleted`);
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    },
    
    /**
     * Clear all sessions from database
     * 
     * WHAT THIS DOES:
     * Deletes EVERYTHING in the store
     * WARNING: This cannot be undone!
     */
    async clearAll() {
        if (!db.instance) {
            await db.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = db.instance.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // clear() = "delete all records"
            const request = store.clear();
            
            request.onsuccess = () => {
                console.log('✅ Database cleared');
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    },
    
    /**
     * Get sessions filtered by language
     * 
     * WHAT THIS DOES:
     * Uses the index we created to quickly find all sessions
     * from a specific language
     */
    async getSessionsByLanguage(language) {
        if (!db.instance) {
            await db.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = db.instance.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            
            // Use the index we created earlier
            const index = store.index('language');
            
            // getAll(language) = "get all records where language = this value"
            const request = index.getAll(language);
            
            request.onsuccess = () => {
                console.log(`📊 Found ${request.result.length} sessions in ${language}`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    },
    
    /**
     * Get sessions from last N days
     * 
     * WHAT THIS DOES:
     * Finds all sessions recorded in the past N days
     * Useful for cleanup or statistics
     */
    async getSessionsFromLastDays(days) {
        if (!db.instance) {
            await db.init();
        }
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        cutoffDateISO = cutoffDate.toISOString();
        
        return new Promise((resolve, reject) => {
            const transaction = db.instance.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            
            const index = store.index('timestamp');
            
            // IDBKeyRange.lowerBound() = "give me everything after this date"
            const range = IDBKeyRange.lowerBound(cutoffDateISO);
            
            const request = index.getAll(range);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    },
    
    /**
     * Update an existing session
     * 
     * WHAT THIS DOES:
     * Modifies a session that's already in the database
     * (e.g., if user adds notes or changes language)
     */
    async updateSession(id, updates) {
        if (!db.instance) {
            await db.init();
        }
        
        // First, get the existing session
        const session = await db.getSession(id);
        
        if (!session) {
            throw new Error(`Session ${id} not found`);
        }
        
        // Merge updates into existing session
        const updatedSession = {
            ...session,
            ...updates,
            id: id  // Keep the same ID
        };
        
        return new Promise((resolve, reject) => {
            const transaction = db.instance.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // put() = "update or add this record"
            const request = store.put(updatedSession);
            
            request.onsuccess = () => {
                console.log(`✅ Session ${id} updated`);
                resolve(updatedSession);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    },
    
    /**
     * Get database statistics
     * 
     * WHAT THIS DOES:
     * Returns info about how much data is stored
     * (useful for showing user how much space is used)
     */
    async getStats() {
        const sessions = await db.getAllSessions();
        
        let totalWords = 0;
        let totalDuration = 0;
        const languages = {};
        
        sessions.forEach(session => {
            totalWords += session.wordCount || 0;
            totalDuration += session.duration || 0;
            
            const lang = session.language || 'unknown';
            languages[lang] = (languages[lang] || 0) + 1;
        });
        
        return {
            totalSessions: sessions.length,
            totalWords,
            totalDuration,
            avgWordsPerSession: sessions.length > 0 
                ? Math.round(totalWords / sessions.length) 
                : 0,
            languages
        };
    }
};

// ========== INITIALIZATION ==========
/**
 * Initialize database when page loads
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await db.init();
        console.log('Database module ready');
    } catch (error) {
        console.error('Database failed:', error);
    }
});

// ========== EXPORTS ==========
// db object is available globally
console.log('📚 db.js loaded');