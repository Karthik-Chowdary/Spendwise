//Data Module
var budgetController = (function(){

var Expense = function(id, description, value){
	this.id = id;
	this.description = description;
	this.value = value;
};

var Income = function(id, description, value){
	this.id = id;
	this.description = description;
	this.value = value;
};

var calculateTotal = function(type){
var sum = 0;
data.allItems[type].forEach(function(current){
	sum += current.value;
});
data.allTotals[type] = sum;
};

var data = {
	allItems: {
		inc: [],
		exp: []
	},
	allTotals: {
		inc: 0,
		exp: 0
	},
	budget: 0,
	percentage:-1
};

testing = function(){
	console.log(data);
};

return {
	addItem: function(type, desc, val){
		var newItem, ID;
		if(data.allItems[type].length < 1){
		ID = 0;
		}else if(data.allItems[type].length >= 1){
		ID = data.allItems[type][data.allItems[type].length - 1].id + 1
		}
		if(type === 'exp'){
			newItem = new Expense(ID, desc, val);
		}else if(type === 'inc'){
			newItem = new Income(ID, desc, val);
		}
		data.allItems[type].push(newItem);
		return newItem;
	},

	deleteItem: function(type, id){
		var ids, index;
		ids = data.allItems[type].map(function(current){
			return current.id;
		});
		index = ids.indexOf(id);

		if(index !== -1){
			data.allItems[type].splice(index, 1);
		}

	},

	calculateBudget: function(){
		//Calculate total income and expenses
		calculateTotal('exp');
		calculateTotal('inc');
		//calculate the budget income - expenses
		data.budget = data.allTotals.inc - data.allTotals.exp;
		//Calculate percentage of income that we spent
		if(data.allTotals.inc > 0){
			data.percentage = Math.round((data.allTotals.exp / data.allTotals.inc) * 100);
		}
		else{
			data.percentage = -1;
		}
		

	},
	getBudget: function(){
		return {
			budget : data.budget,
			totalInc : data.allTotals.inc,
			totalExp : data.allTotals.exp,
			percentage : data.percentage
		};
	},
	testing: function(){
	console.log(data);
}
};



})();

//UI Module
var UIController = (function(){

var DOMStrings = {
	inputType: '.add__type',
	inputDescription: '.add__description',
	inputValue: '.add__value',
	inputButton: '.add__btn',
	incomeContainer: '.income__list',
	expensesContainer: '.expenses__list',
	budgetLabel: '.budget__value',
	incomeLabel: '.budget__income--value',
	expenseLabel: '.budget__expenses--value',
	percentageLabel: '.budget__expenses--percentage',
	container: '.container'
};

var formatNumber = function(num, type){
		var numSplit, int, dec, type;
		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');
		int = numSplit[0];
		if(int.length > 3){
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

return {
	getInput: function(){
		return {
			type: document.querySelector(DOMStrings.inputType).value,
			description: document.querySelector(DOMStrings.inputDescription).value,
			value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
		};
	},

	
	getDOMStrings: function(){
		return DOMStrings;
	},

	addListItem: function(obj, type){
		var html, newHtml, element;
		//HTML string with placeholder text
		if(type === 'inc'){
			element = DOMStrings.incomeContainer;

			html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
		}
		else if(type === 'exp'){
			element = DOMStrings.expensesContainer;

			html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
		}

		var expPercent = document.getElementById('change%').innerHTML;
		var expPercentSplit = expPercent.split('.');
		var expPercentSplit1 = expPercentSplit[0].split(' ');
		var expPercentSplit2 = expPercentSplit1[1].split(',');
		var expPercentFinal = parseInt(expPercentSplit2[0] + expPercentSplit2[1]);
		console.log(expPercentFinal);
		//Replace placeholder text with actual data
		newHtml = html.replace('%id%', obj.id);
		newHtml = newHtml.replace('%description%', obj.description);
		newHtml = newHtml.replace('%21%', Math.round((obj.value/expPercentFinal)*100) + '%');
		newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
		
		//populate in DOM
		document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
	},

	deleteListItem: function(id){
		var el = document.getElementById(id);
		el.parentNode.removeChild(el);
	},
	clearFields: function(){
		var fields, fieldsArr;
		fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
		fieldsArr = Array.prototype.slice.call(fields);
		fieldsArr.forEach(function(current, index, array){
			current.value = "";
		});
			fieldsArr[0].focus();
		},
	displayBudget: function(Obj){
		var type;
		Obj.budget > 0 ? type = 'inc' : type = 'exp';
		document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(Obj.budget, type);
		document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(Obj.totalInc, 'inc');
		document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(Obj.totalExp, 'exp');
		if(Obj.percentage > 0){
			document.querySelector(DOMStrings.percentageLabel).textContent = Obj.percentage + '%';	
		}
		else{
			document.querySelector(DOMStrings.percentageLabel).textContent = '---';
		}


	}
	};

})();

//Controller Module
var controller = (function(budgetCtrl, UIctrl){

var setUpEventListeners = function(){
	var DOM = UIctrl.getDOMStrings();
	document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
	document.addEventListener('keypress', function(e){
	if(e.keyCode === 13 || e.which === 13){
		ctrlAddItem();
	}
});
	document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
};

var updateBudget = function(){
	//4. Calculate the budget
	budgetCtrl.calculateBudget();
	// Return  budget
	var budget = budgetCtrl.getBudget();
	//5. Display budget on UI
	UIctrl.displayBudget(budget);
}

var ctrlAddItem = function(){

	var Input, newItem;
	//1. Get Input
	Input = UIctrl.getInput();
	if(Input.Description != ""  && !isNaN(Input.value) && Input.value > 0){
		//2. Add item to budget controller
	newItem = budgetCtrl.addItem(Input.type, Input.description, Input.value);
	//3. Add  item to UI
	UIctrl.addListItem(newItem, Input.type);
	UIctrl.clearFields();

	updateBudget();
	
	}

	
}

var ctrlDeleteItem = function(event){
	console.log('Im here');
	var itemID, splitID, type, ID;
	itemID = event.target.parentNode.parentNode.parentNode.id;
	console.log(itemID);
	if(itemID){
	splitID = itemID.split('-');
	type = splitID[0];
	ID = parseInt(splitID[1]);
	console.log(splitID);
	//delete item from data structure
	budgetCtrl.deleteItem(type, ID);
	//delete the item from UI
	UIctrl.deleteListItem(itemID);
	//update the budget
	updateBudget();
	}
};

return {
	init: function(){
		console.log('Application has started');
		UIctrl.displayBudget({
			budget : 0,
			totalInc : 0,
			totalExp : 0,
			percentage : -1
		});
		setUpEventListeners();
	}
};
})(budgetController, UIController);


controller.init();