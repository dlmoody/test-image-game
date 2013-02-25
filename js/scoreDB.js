		// indexeddb
		window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
		window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
		window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

		var UserScoreDb = {}; // namespace (not required)
		UserScoreDb.indexedDB = {}; // open, addScore, getAllTodoItems, deleteTodo - are own methods
		UserScoreDb.indexedDB.db = null; // holds the real instance of the indexedDB

		// open/create
		UserScoreDb.indexedDB.open = function() {
			// you must increment the version by +1 in order to get the 'onupgradeneeded' event called
			// ONLY there you can modify the db itself e.g create new object stores and etc.
			var request = indexedDB.open('scores', 2);
			console.log(request);
			
			request.onupgradeneeded = function(e) {
				console.log('onupgradeneeded', e);

				UserScoreDb.indexedDB.db = e.target.result;
				var db = UserScoreDb.indexedDB.db;
				console.log('db', db);

				if(!db.objectStoreNames.contains('score')){
					db.createObjectStore('score', {keyPath: 'id', autoIncrement: true});
				}
			};

			request.onsuccess = function(e) {
				console.log('onsuccess', e);
				UserScoreDb.indexedDB.db = e.target.result;
				var db = UserScoreDb.indexedDB.db;
				console.log('db', db);

				// START chrome (obsolete - will be removed)
				if (typeof db.setVersion === 'function') {
					var versionReq = db.setVersion(2);
					versionReq.onsuccess = function (e) {
						console.log('versionReq', e);

						UserScoreDb.indexedDB.db = e.target.source; // instead of result
						var db = UserScoreDb.indexedDB.db;
						console.log('db', db);

						if(!db.objectStoreNames.contains('score')){
							db.createObjectStore('score', {keyPath: 'id', autoIncrement: true});
						}
					}
				}
				// END chrome
				//UserScoreDb.indexedDB.getAllScoreItems();
			};
		};

		// add
		UserScoreDb.indexedDB.addScore = function(score) {
			var db = UserScoreDb.indexedDB.db;
			var trans = db.transaction(['score'], 'readwrite');
			var store = trans.objectStore('score');
			var request = store.put({
				'score': score
			});

			request.onsuccess = function(e) {
				// Re-render all the todo's
				//UserScoreDb.indexedDB.getAllScoreItems();
			};

			request.onerror = function(e) {
				console.log(e.value);
			};
		};

		// read
		UserScoreDb.indexedDB.getAllScoreItems = function(renderer) {
			
			var db = UserScoreDb.indexedDB.db;
			var trans = db.transaction(['score'], 'readwrite');
			var store = trans.objectStore('score');

			// Get everything in the store;
			var keyRange = IDBKeyRange.lowerBound(0);
			var cursorRequest = store.openCursor(keyRange);

			cursorRequest.onsuccess = function(e) {
				var result = e.target.result;
				if(!!result == false)
					return;

				renderer(result.value);
				result.continue();
			};

			cursorRequest.onerror = UserScoreDb.indexedDB.onerror;
		};

		// delete
		UserScoreDb.indexedDB.deleteScore = function(id) {
			var db = UserScoreDb.indexedDB.db;
			var trans = db.transaction(['score'], 'readwrite');
			var store = trans.objectStore('score');

			var request = store.delete(id);

			request.onsuccess = function(e) {
				//UserScoreDb.indexedDB.getAllScoreItems();  // Refresh the screen
			};

			request.onerror = function(e) {
				console.log(e);
			};
		};