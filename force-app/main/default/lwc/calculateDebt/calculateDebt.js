import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
	{ label: 'Creditor', fieldName: 'creditorName' },
	{ label: 'First Name', fieldName: 'firstName' },
	{ label: 'Last Name', fieldName: 'lastName' },
	{ label: 'Min Pay %', fieldName: 'minPaymentPercentage' },
	{ label: 'Balance', fieldName: 'balance' }

	];
export default class CalculateDebt extends LightningElement {
	
	columns = columns;
	total = 0;
	@track rawData = [];
	totalRows = 0;
	selectedRowCount = 0;
	selectedRowBalance = 0;
	@track selectedRowsList =[];
	totalBalance = 0;
	ShowModal = false;

	connectedCallback(){
		/**
		 * This code allows to make GET Request to the URL to retrieve the JSON data that can be store in rawData list.
		 * to run it on Webcomponents.dev
		 */
		let endPoint = "https://raw.githubusercontent.com/StrategicFS/Recruitment/master/data.json";
		fetch(endPoint, {
			method: "GET"
			})
			.then((response) => response.json()) 
			//response.json() gives us back a promise we need to process the promise in .then()
			.then((res) => {
				console.log(JSON.stringify(res));
				this.rawData = [...res];
				//Calculate the total balance for all rows
				this.calculateTotal(this.rawData);
			});
	}

	/**
	 * 
	 * @param event 
	 * Get all selected rows from Lightning Data Table
	 */
	getSelectedIdAction(event){
		this.selectedRowsList =[];
		const selectedRows = event.detail.selectedRows;
		this.selectedRowBalance = 0;
		for (let i = 0; i<selectedRows.length; i++){
			this.selectedRowsList.push(selectedRows[i]);
			this.selectedRowBalance += selectedRows[i].balance;
		}

		this.selectedRowCount = selectedRows.length;
	}

	/**
	 * method will calculate Total balance for all rows
	 */
	calculateTotal(){
		this.totalBalance = 0;
		this.totalRows = this.rawData.length;
		for (let i = 0; i<this.rawData.length; i++){
			this.totalBalance += parseInt(this.rawData[i].balance); 
		}
	}

	/**
	 * 
	 * @param event 
	 * Add Debt details item to the list using Lightning Modal
	 */
	addDebt(event){

		let creditor = '';
		let firstname = '';
		let lastname = '';
		let minpay = '';
		let balance = 0;

		this.template.querySelectorAll("lightning-input").forEach(ele => {

			if(ele.name == 'creditor')
				creditor = ele.value;
			if(ele.name == 'firstname')
				firstname = ele.value;
			if(ele.name == 'lastname')
				lastname = ele.value;
			if(ele.name == 'minpay')
				minpay = ele.value;
			if(ele.name == 'balance')
				balance += parseInt(ele.value);
		});

		this.rawData = [...this.rawData, {
			"id": this.rawData.length > 0 ? this.rawData[this.rawData.length-1].id + 1 : 1,
			"creditorName": creditor,
			"firstName": firstname,
			"lastName": lastname,
			"minPaymentPercentage": minpay,
			"balance": !balance ? 0 : balance
			}]

		this.calculateTotal();
		this.showToast('Debt Details Added', 'Successfully Added debt details.', 'success');
		this.ShowModal = false;
	}

	/**
	 * 
	 * @param event 
	 * method used to delete the debt details from  the list
	 */
	deleteDebt(event){

		if (this.rawData.length > 0) {
			for (var i=0; i<this.selectedRowsList.length; i++) {
				var index = undefined;
				index = this.rawData.findIndex(ele => ele.id == this.selectedRowsList[i].id);
				if(index !== -1) {
					this.rawData.splice(index, 1);
				}
			}
		}
		this.rawData = [...this.rawData]; //this is required for @track keyword to work.
		this.selectedRowsList = [];
		this.showToast('Debt Details Removed', 'Successfully Removed debt details.', 'success');
		this.calculateTotal();
	}

	openModal() {    
		this.ShowModal = true;
	}
 
	closeModal() {    
		this.ShowModal = false;
	}

	/**
	 * 
	 * @param {string} title  : title of the toast
	 * @param {string} msg  : Message to be disaplyed to the user
	 * @param {string} variant : success/error
	 */
	showToast(title, msg, variant){
		const evt = new ShowToastEvent({
			title: title,
			message: msg,
			variant: variant,
			mode: 'dismissable'
		});
		this.dispatchEvent(evt);
	}

}