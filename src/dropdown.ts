/*
 *	Dropdown class. Manages the dropdown drawing
 */
export class Dropdown {
	protected _$el:JQuery;
	protected _dd:JQuery;
	protected initialized:boolean = false;
	protected shown:boolean = false;
	protected items:any[] = [];
	protected formatItem:Function;
	protected searchText:string;
	protected autoSelect:boolean;
	protected mouseover:boolean;
	protected noResultsText:string;

	constructor(e:JQuery, formatItemCbk:Function, autoSelect:boolean, noResultsText:string) {
		this._$el = e;
		this.formatItem = formatItemCbk;
		this.autoSelect = autoSelect;
		this.noResultsText = noResultsText;
		
		this.init();
	}
	
	protected init():void {
		// Initialize dropdown
		let pos:any = $.extend({}, this._$el.position(), {
        				height: this._$el[0].offsetHeight
    				});
		
		// create element
		this._dd = $('<ul />');
		// add our class and basic dropdown-menu class
		this._dd.addClass('bootstrap-autocomplete dropdown-menu');

		this._dd.insertAfter(this._$el);
		this._dd.css({ left: pos.left, width: this._$el.outerWidth() });
		
		// click event on items
		this._dd.on('click', 'li', (evt:JQueryEventObject) => {
			// console.log('clicked', evt.currentTarget);
			//console.log($(evt.currentTarget));
			let item:any = $(evt.currentTarget).data('item');
			this.itemSelectedLaunchEvent(item);
		});
		
		this._dd.on('keyup', (evt:JQueryEventObject) => {
			if (this.shown) {
				switch (evt.which) {
					case 27:
						// ESC
						this.hide();
						this._$el.focus();
						break;
				}
				return false;
			}
		});

		this._dd.on('mouseenter', 'li', (evt:JQueryEventObject) => {
			if (this.haveResults) {
				$(evt.currentTarget).closest('ul').find('li.active').removeClass('active');
				$(evt.currentTarget).addClass('active');
				this.mouseover = true;
			}
		});

		this._dd.on('mouseleave', 'li', (evt:JQueryEventObject) => {
			this.mouseover = false;
		});

		this.initialized = true;
		
	}

	get isMouseOver():boolean {
		return this.mouseover;
	}

	get haveResults():boolean {
		return (this.items.length > 0);
	}

	public focusNextItem(reversed?:boolean) {
		if (this.haveResults) {
			// get selected
			let currElem:JQuery = this._dd.find('li.active');
			let nextElem:JQuery = reversed ? currElem.prev() : currElem.next();

			if (nextElem.length == 0) {
				// first 
				nextElem = reversed ? this._dd.find('li').last() : this._dd.find('li').first();
			}
			
			currElem.removeClass('active');
			nextElem.addClass('active');
		}
	}

	public focusPreviousItem() {
		this.focusNextItem(true);
	}

	public selectFocusItem() {
		this._dd.find('li.active').trigger('click');
	}

	get isItemFocused():boolean {
		if (this._dd.find('li.active').length > 0) {
			return true;
		}
		return false;
	}

	public show():void {
		if (!this.shown) {
			this._dd.dropdown().show();
			this.shown = true;
		}
	}

	public isShown():boolean {
		return this.shown;
	}

	public hide():void {
		if (this.shown) {
			this._dd.dropdown().hide();
			this.shown = false;
		}
	}

	public updateItems(items:any[], searchText:string) {
		// console.log('updateItems', items);
		this.items = items;
		this.searchText = searchText;
		this.refreshItemList();
	}

	private showMatchedText(text:string, qry:string):string {
		let startIndex:number = text.toLowerCase().indexOf(qry.toLowerCase());
		if (startIndex > -1) {
			let endIndex:number = startIndex + qry.length;

			return text.slice(0, startIndex) + '<b>' 
				+ text.slice(startIndex, endIndex) + '</b>'
				+ text.slice(endIndex);
		}
		return text;
	}

	protected refreshItemList() {
		this._dd.empty();
		let liList:JQuery[] = [];
		if (this.items.length > 0) {
			this.items.forEach(item => {
				let itemFormatted:any = this.formatItem(item);
				if (typeof itemFormatted === 'string') {
					itemFormatted = { text: itemFormatted }
				}
				let itemText:string;
				let itemHtml:any;

				itemText = this.showMatchedText(itemFormatted.text, this.searchText);
				if ( itemFormatted.html !== undefined ) {
					itemHtml = itemFormatted.html;
				} else {
					itemHtml = itemText;
				}
				
				let li = $('<li >');
				li.append(
					$('<a>').attr('href', '#').html(itemHtml)
				)
				.data('item', item);
				
				liList.push(li);
			});
		} else {
			// No results
			let li = $('<li >');
			li.append(
				$('<a>').attr('href', '#').html(this.noResultsText)
			)
			.addClass('disabled');

			liList.push(li);
		}

		 
		this._dd.append(liList);
	}

	protected itemSelectedLaunchEvent(item:any):void {
		// launch selected event
		// console.log('itemSelectedLaunchEvent', item);
		this._$el.trigger('autocomplete.select', item)
	}

}