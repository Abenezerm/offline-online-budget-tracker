let db;

//Creates a new "budget" db...
const request = indexedDB.open('budget', 1);

const dbCheck = ()
  //open transaction, acess 'paymeny object', & gets all records - setting them to a variable...
  const transaction = db.transaction(['payment'], 'readwerite');
  const tos = transaction.objectStore('payment');
  const getAll = tos.getAll();

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
//when upgrading is needed...
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('payment', { autoIncrement: true });
};


//In case there is an error...
request.onerror = function (event) {
  console.log(`An Error has occured: ${event.console.errorCode}`);
}
