var budgetController = (function() {
	class Expense {
		constructor(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
			this.percentage = -1;
		}
	}

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome * 100);
		}
		else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	class Income {
		constructor(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
		}
	}

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(currentValue, index, array) {
			sum += currentValue.value;
		});
		data.totals[type] = sum;
	};

	return {
		addItem: function(type, describe, valeur) {

			var newItem;
			var ID,
				ID = 0;


			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
				console.log(ID);
			}
			else {
				ID = 0;
			}

			if (type === "exp") {
				newItem = new Expense(ID, describe, valeur);
			}
			else if (type === "inc") {
				newItem = new Income(ID, describe, valeur);
			}

			data.allItems[type].push(newItem);

			console.log(newItem);
			return newItem;
		},

		deleteItem: function(type, id) {
			var identifications = data.allItems[type].map(function(currentValue) {
				return currentValue.id;
			});

			var index = identifications.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			calculateTotal("exp");
			calculateTotal("inc");
			data.budget = data.totals.inc - data.totals.exp;
			if (data.totals.inc > 0) {
				data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
			}
			else {
				data.percentage = -1;
			}
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalIncome: data.totals.inc,
				totalExpenses: data.totals.exp,
				totalPercentage: data.percentage
			};
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(currentValue, index, array) {
				currentValue.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allPercentages = data.allItems.exp.map(function(currentValue, index, array) {
				return currentValue.getPercentage();
			});
			return allPercentages;
		},

		// TESTING:
		testing: function() {
			console.log(data);
		}
	};
})();


// NOTE:  Module from the User Interface
var UIController = (function() {
	var DOMStrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputButton: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expensesLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expensesPercentageLabel: ".item__percentage",
		dateLabel: ".budget__title--month"
	};

	var formatNumber = function(num, type) {
		num = Math.abs(num);
		num = num.toFixed(2);

		var numSplit = num.split(".");
		var intString = numSplit[0];
		if (intString.length > 3) {
			intString = intString.substr(0, intString.length - 3) + "," + intString.substr(intString.length - 3, 3); // NOTE: 2310 devient 2,310
		}

		var decString = numSplit[1];

		return (type === "exp" ? "-" : "+") + " " + intString + "." + decString;
	};

	var nodeListForEach = function(nodeList, callbackFn) {
		for (var i = 0; i < nodeList.length; i++) {
			callbackFn(nodeList[i], i);
		}
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // Will be either inc (income) or exp (expenses)
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHTML, element, fields, fieldsArray;

			if (type === "inc") {
				element = DOMStrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline" id="item-inc-%id%"></i></button></div></div></div>';
			}
			else if (type === "exp") {
				element = DOMStrings.expensesContainer;
				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline" id="item-exp-%id%"></i></button></div></div></div>';
			}

			newHTML = html.replace(new RegExp("%id%", "g"), obj.id);
			newHTML = newHTML.replace("%description%", obj.description);
			newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

			document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
		},

		deleteListItem: function(selectorID) {
			var removeID = document.getElementById(selectorID);
			removeID.parentNode.removeChild(removeID);
		},

		clearFields: function() {
			fields = document.querySelectorAll(DOMStrings.inputDescription + "," + DOMStrings.inputValue);

			fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(function(currentValue, index, array) {
				currentValue.value = "";
			});

			fieldsArray[0].focus();
		},

		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? (type = "inc") : (type = "exp");
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, "inc");
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, "exp");

			if (obj.totalPercentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.totalPercentage + "%";
			}
			else {
				document.querySelector(DOMStrings.percentageLabel).textContent = "---";
			}
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

			nodeListForEach(fields, function(currentValue, index) {
				if (percentages[index] > 0) {
					currentValue.textContent = percentages[index] + "%";
				}
				else {
					currentValue.textContent = percentages[index] + "---";
				}
			});
		},

		displayMonth: function() {
			var now = new Date();
			var months = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			];
			var month = now.getMonth();
			var year = now.getFullYear();

			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year;
		},

		changedType: function() {
			var fields = document.querySelectorAll(
				DOMStrings.inputType + "," + DOMStrings.inputDescription + "," + DOMStrings.inputValue
			);
			nodeListForEach(fields, function(currentValue) {
				currentValue.classList.toggle("red-focus");
			});
			document.querySelector(DOMStrings.inputButton).classList.toggle("red");
		},

		getDOMStrings: function() {
			return DOMStrings;
		}
	};
})();

var controller = (function(budgetCtrl, UICtrl) {
	var eventListenerSetup = function() {
		var DOM = UICtrl.getDOMStrings();

		document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);
		document.addEventListener("keypress", function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
	};

	var updateBudget = function() {
		budgetCtrl.calculateBudget();
		var budgetInfo = budgetCtrl.getBudget();
		UICtrl.displayBudget(budgetInfo);

		TESTING: console.log(budgetInfo);
	};

	var updatePercentages = function() {
		budgetCtrl.calculatePercentages();
		var percents = budgetCtrl.getPercentages();
		UICtrl.displayPercentages(percents);

		TESTING: console.log(percents);
	};

	var ctrlAddItem = function() {
		var input;
		var newAddedItem;
		var newItemDisplay;

		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			newAddedItem = budgetCtrl.addItem(input.type, input.description, input.value);
			UICtrl.addListItem(newAddedItem, input.type);
			UICtrl.clearFields();
			updateBudget();
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event) {
		var itemID = event.target.id.substring(5); 
		console.log(itemID);
		if (itemID) {
			var splitID = itemID.split("-");
			var type = splitID[0];
			var ID = parseInt(splitID[1]);
			budgetCtrl.deleteItem(type, ID);
			UICtrl.deleteListItem(itemID);
			updateBudget();
			updatePercentages();
		}
	};

	return {
		init: function() {
			console.log("Programme has launched. Programme est lancé");
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpenses: 0,
				totalPercentage: -1
			});
			eventListenerSetup();
		}
	};
})(budgetController, UIController);

controller.init();
