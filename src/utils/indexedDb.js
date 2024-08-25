async function openDB(dbName, version = 1) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('jsonStore')) {
                db.createObjectStore('jsonStore', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function writeToDB(dbName, jsonObject) {
    try {
        const db = await openDB(dbName);
        const transaction = db.transaction(['jsonStore'], 'readwrite');
        const store = transaction.objectStore('jsonStore');

        return new Promise((resolve, reject) => {
            const request = store.put({ id: 'jsonData', data: jsonObject });

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Failed to write to DB:', error);
        throw error;
    }
}

async function readFromDB(dbName) {
    try {
        const db = await openDB(dbName);
        const transaction = db.transaction(['jsonStore'], 'readonly');
        const store = transaction.objectStore('jsonStore');

        return new Promise((resolve, reject) => {
            const request = store.get('jsonData');

            request.onsuccess = (event) => {
                resolve(event.target.result?.data);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Failed to read from DB:', error);
        throw error;
    }
}

export {
    writeToDB,
    readFromDB,
};

// Usage Example:
// const myJson = { key: 'value', anotherKey: 42 };
// await writeToDB('myDatabase', myJson);
// const data = await readFromDB('myDatabase');
// console.log('Data retrieved:', data);
