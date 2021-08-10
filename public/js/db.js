let db;

//Creates a new "budget" db...
const request = indexedDB.open('budget', 1);

//when we connect successfully...
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    dbCheck();
  }
};

//In case there is an error...
request.onerror = function (event) {
  console.log(`An Error has occured: ${event.console.errorCode}`);
}

//when upgrading is needed...
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('payment', { autoIncrement: true });
};


const dbCheck = () => {
  //open transaction, acess 'paymeny object', & gets all records - setting them to a variable...
  const transaction = db.transaction(['payment'], 'readwrite')
  const tos = transaction.objectStore('payment')
  const getAll = tos.getAll()

  //if request is susccesful...
  getAll.onsuccess = function () {
    //bulks and tries to post any payments we have...
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        }
      })
      .then(response => response.json())
      .then(() => {
          //once the bulk is done, this clears existing entires....
          const transaction = db.transaction(['payment'], "readwrite");
          const tos = transaction.objectStore('payment');
          tos.clear();
      });
    }
  };

}

//open transaction, acess 'payment' object, adds data...
const saveRecord = (data) =>{
  const transaction = db.transaction(['payment'], 'readwrite');
  const tos = transaction.objectStore('payment');
  tos.add(data)
}
