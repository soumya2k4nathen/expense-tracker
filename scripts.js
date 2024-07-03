const apiUrl = 'http://localhost:3000/api/expenses';

document.getElementById('expenseForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const expenseName = document.getElementById('expenseName').value;
  const expenseCategory = document.getElementById('expenseCategory').value;
  const amount = document.getElementById('amount').value;
  const expenseDate = document.getElementById('expenseDate').value;

  const newExpense = {
    expense_name: expenseName,
    expense_category: expenseCategory,
    amount: amount,
    expense_date: expenseDate
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newExpense)
    });

    if (!response.ok) {
      throw new Error('Failed to add expense');
    }

    document.getElementById('expenseForm').reset();
    getExpenses(); // Refresh the entire list after adding new expense
  } catch (error) {
    console.error('Error adding expense:', error);
  }
});

async function getExpenses(category = null, year = null, month = null) {
  try {
    let url = apiUrl;
    if (category) {
      url += `/category/${category}`;
    } else if (year && month) {
      url += `/${year}/${month}`;
    }

    const response = await fetch(url);
    const expenses = await response.json();

    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = '';

    expenses.forEach(expense => {
      const listItem = document.createElement('li');
      listItem.textContent = `${expense.expense_name} - ${expense.expense_category} - ${expense.amount} - ${expense.expense_date}`;

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteExpense(expense.id));

      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => editExpense(expense.id));

      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);

      expensesList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
}

async function deleteExpense(id) {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }

    getExpenses(); // Refresh the entire list after deletion
  } catch (error) {
    console.error('Error deleting expense:', error);
  }
}

async function editExpense(id) {
  const expenseName = prompt('Enter new expense name');
  const expenseCategory = prompt('Enter new category');
  const amount = prompt('Enter new amount');
  const expenseDate = prompt('Enter new date (YYYY-MM-DD)');

  if (!expenseName || !expenseCategory || !amount || !expenseDate) {
    alert('All fields are required');
    return;
  }

  const updatedExpense = {
    expense_name: expenseName,
    expense_category: expenseCategory,
    amount: amount,
    expense_date: expenseDate
  };

  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedExpense)
    });

    if (!response.ok) {
      throw new Error('Failed to update expense');
    }

    getExpenses();
  } catch (error) {
    console.error('Error updating expense:', error);
  }
}


async function filterExpensesByCategory() {
  const category = document.getElementById('filterCategory').value;
  if (category) {
    getExpenses(category);
  } else {
    getExpenses();
  }
}

// Function to filter expenses by month and year
async function filterExpensesByDate() {
  const year = document.getElementById('filterYear').value;
  const month = document.getElementById('filterMonth').value;
  if (year && month) {
    getExpenses(null, year, month);
  } else {
    getExpenses();
  }
}
getExpenses();
