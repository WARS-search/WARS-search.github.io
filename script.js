var search, results, allBooks = [];

var indexOnAddressCheckbox = document.getElementById('indexOnAddressCheckbox');
var indexStrategySelect = document.getElementById('indexStrategySelect');
var removeStopWordsCheckbox = document.getElementById('removeStopWordsCheckbox');
var indexOnDistrictCheckbox = document.getElementById('indexOnDistrictCheckbox');
var indexOnDateCheckbox = document.getElementById('indexOnDateCheckbox');
var useStemmingCheckbox = document.getElementById('useStemmingCheckbox');
var sanitizerSelect = document.getElementById('sanitizerSelect');
var tfIdfRankingCheckbox = document.getElementById('tfIdfRankingCheckbox');

var rebuildAndRerunSearch = function() {
  rebuildSearchIndex();
  searchBooks();
};

indexOnAddressCheckbox.onchange = rebuildAndRerunSearch;
indexStrategySelect.onchange = rebuildAndRerunSearch;
removeStopWordsCheckbox.onchange = rebuildAndRerunSearch;
indexOnDistrictCheckbox.onchange = rebuildAndRerunSearch;
useStemmingCheckbox.onchange = rebuildAndRerunSearch;
sanitizerSelect.onchange = rebuildAndRerunSearch;
tfIdfRankingCheckbox.onchange = rebuildAndRerunSearch;

var rebuildSearchIndex = function() {
  search = new JsSearch.Search('number');

  if (useStemmingCheckbox.checked) {
    search.tokenizer = new JsSearch.StemmingTokenizer(stemmer, search.tokenizer);
  }
  if (removeStopWordsCheckbox.checked) {
    search.tokenizer = new JsSearch.StopWordsTokenizer(search.tokenizer);
  }

  search.indexStrategy =  eval('new ' + indexStrategySelect.value + '()');
  search.sanitizer =  eval('new ' + sanitizerSelect.value + '()');;

  if (tfIdfRankingCheckbox.checked) {
    search.searchIndex = new JsSearch.TfIdfSearchIndex('number');
  } else {
    search.searchIndex = new JsSearch.UnorderedSearchIndex();
  }

  if (indexOnDistrictCheckbox.checked) {
    search.addIndex('district');
  }
  if (indexOnAddressCheckbox.checked) {
    search.addIndex('address');
  }
  if (indexOnDateCheckbox.checked) {
    search.addIndex('address');
  }

  search.addDocuments(allBooks);
};

var indexedBooksTable = document.getElementById('indexedBooksTable');
var indexedBooksTBody = indexedBooksTable.tBodies[0];
var searchInput = document.getElementById('searchInput');
var bookCountBadge = document.getElementById('bookCountBadge');

var updateBooksTable = function(books) {
  indexedBooksTBody.innerHTML = '';

  var tokens = search.tokenizer.tokenize(searchInput.value);

  for (var i = 0, length = books.length; i < length; i++) {
    var book = books[i];

    var numberColumn = document.createElement('td');
    numberColumn.innerText = book.number;

    var districtColumn = document.createElement('td');
    districtColumn.innerHTML = book.district;

    var addressColumn = document.createElement('td');
    addressColumn.innerHTML = book.address;

    var dateColumn = document.createElement('td');
    dateColumn.innerHTML = book.date;

    var tableRow = document.createElement('tr');
    tableRow.appendChild(numberColumn);
    tableRow.appendChild(districtColumn);
    tableRow.appendChild(addressColumn);
    tableRow.appendChild(dateColumn);

    indexedBooksTBody.appendChild(tableRow);
  }
};

var updateBookCountAndTable = function() {
  updateBookCount(results.length);

  if (results.length > 0) {
    updateBooksTable(results);
  } else if (!!searchInput.value) {
    updateBooksTable([]);
  } else {
    updateBookCount(allBooks.length);
    updateBooksTable(allBooks);
  }
};

var searchBooks = function() {
  results = search.search(searchInput.value);
  updateBookCountAndTable();
};

searchInput.oninput = searchBooks;

var updateBookCount = function(numBooks) {
  bookCountBadge.innerText = numBooks + ' books';
};
var hideElement  = function(element) {
  element.className += ' hidden';
};
var showElement = function(element) {
  element.className = element.className.replace(/\s*hidden/, '');
};

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    var json = JSON.parse(xmlhttp.responseText);

    allBooks = json.books;

    updateBookCount(allBooks.length);

    var loadingProgressBar = document.getElementById('loadingProgressBar');
    hideElement(loadingProgressBar);
    showElement(indexedBooksTable);

    rebuildSearchIndex();
    updateBooksTable(allBooks);
  }
}
xmlhttp.open('GET', 'books.json', true);
xmlhttp.send();