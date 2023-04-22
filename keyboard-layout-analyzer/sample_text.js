/**
 * @fileoverview Main module for the record app.
 */

goog.module('record.app');

const api = goog.require('record.api');
const list = goog.require('record.list');
const detail = goog.require('record.detail');
const edit = goog.require('record.edit');

/**
 * Initializes the app.
 */
function init() {
  const container = document.getElementById('container');
  const listModule = new list.ListModule(api);
  const detailModule = new detail.DetailModule(api);
  const editModule = new edit.EditModule(api);
  container.appendChild(listModule.getElement());
  container.appendChild(detailModule.getElement());
  container.appendChild(editModule.getElement());
  listModule.init();
}

exports = {
  init,
};
/**
 * @fileoverview Module for the record list.
 */

goog.module('record.list');

const api = goog.require('record.api');

/**
 * @implements {goog.disposable.IDisposable}
 */
class ListModule {
  /**
   * @param {!record.api.Api} api
   */
  constructor(api) {
    /**
     * @private {!record.api.Api}
     */
    this.api_ = api;

    /**
     * @private {!Element}
     */
    this.element_ = document.createElement('div');

    /**
     * @private {!Array<!Element>}
     */
    this.listItems_ = [];

    /**
     * @private {!goog.events.EventHandler<!ListModule>}
     */
    this.eventHandler_ = new goog.events.EventHandler(this);
  }

  /** @override */
  dispose() {
    this.eventHandler_.dispose();
  }

  /**
   * Initializes the module.
   */
  init() {
    this.api_.listRecords().then((records) => {
      for (const record of records) {
        const listItem = this.createListItem_(record);
        this.element_.appendChild(listItem);
        this.listItems_.push(listItem);
        this.eventHandler_.listen(listItem, goog.events.EventType.CLICK, () => {
          goog.array.forEach(this.listItems_, (item) => {
            goog.dom.classlist.enable(item, 'selected', item === listItem);
          });
          goog.events.dispatchEvent(this, new ListModule.ItemSelectedEvent(record));
        });
      }
    });
  }

  /**
   * @param {!record.api.Record} record
   * @return {!Element}
   * @private
   */
  createListItem_(record) {
    const listItem = document.createElement('div');
    goog.dom.classlist.add(listItem, 'list-item');
    const nameLabel = document.createElement('div');
    goog.dom.classlist.add(nameLabel, 'list-item-name');
    nameLabel.textContent = record.name;
    listItem.appendChild(nameLabel);
    const dateLabel = document.createElement('div');
    goog.dom.classlist.add(dateLabel, 'list-item-date');
    dateLabel.textContent = record.date.toLocaleString();
    listItem.appendChild(dateLabel);
    return listItem;
  }

  /**
   * @return {!Element}
   */
  getElement() {
    return this.element_;
  }
}

/**
 * @extends {goog.events.Event}
 */
ListModule.ItemSelectedEvent = class extends goog.events.Event {
  /**
   * @param {!record.api.Record} record
   */
  constructor(record) {
    super(ListModule.EventType.ITEM_SELECTED);

    /**
     * @const {!record.api.Record}
     */
    this.record = record;
  }
};

/**
 * @enum {string}
 */
ListModule.EventType = {
  ITEM
_SELECTED: 'item-selected',
};

exports = {
ListModule,
};

```javascript
/**
 * @fileoverview Module for the record detail.
 */

goog.module('record.detail');

const api = goog.require('record.api');

/**
 * @implements {goog.disposable.IDisposable}
 */
class DetailModule {
  /**
   * @param {!record.api.Api} api
   */
  constructor(api) {
    /**
     * @private {!record.api.Api}
     */
    this.api_ = api;

    /**
     * @private {!Element}
     */
    this.element_ = document.createElement('div');

    /**
     * @private {!Element}
     */
    this.nameLabel_ = document.createElement('div');

    /**
     * @private {!Element}
     */
    this.numberLabel_ = document.createElement('div');

    /**
     * @private {!Element}
     */
    this.dateLabel_ = document.createElement('div');

    /**
     * @private {!goog.events.EventHandler<!DetailModule>}
     */
    this.eventHandler_ = new goog.events.EventHandler(this);
  }

  /** @override */
  dispose() {
    this.eventHandler_.dispose();
  }

  /**
   * Initializes the module.
   */
  init() {
    this.eventHandler_.listen(this, ListModule.EventType.ITEM_SELECTED, (event) => {
      this.api_.getRecord(event.record.id).then((record) => {
        this.nameLabel_.textContent = record.name;
        this.numberLabel_.textContent = record.number;
        this.dateLabel_.textContent = record.date.toLocaleString();
      });
    });
  }

  /**
   * @return {!Element}
   */
  getElement() {
    goog.dom.classlist.add(this.element_, 'detail');
    this.element_.appendChild(this.nameLabel_);
    this.element_.appendChild(this.numberLabel_);
    this.element_.appendChild(this.dateLabel_);
    return this.element_;
  }
}

exports = {
  DetailModule,
};
/**
 * @fileoverview Module for the record edit.
 */

goog.module('record.edit');

const api = goog.require('record.api');

/**
 * @implements {goog.disposable.IDisposable}
 */
class EditModule {
  /**
   * @param {!record.api.Api} api
   */
  constructor(api) {
    /**
     * @private {!record.api.Api}
     */
    this.api_ = api;

    /**
     * @private {!Element}
     */
    this.element_ = document.createElement('div');

    /**
     * @private {!Element}
     */
    this.nameInput_ = document.createElement('input');

    /**
     * @private {!Element}
     */
    this.numberInput_ = document.createElement('input');

    /**
     * @private {!Element}
     */
    this.dateInput_ = document.createElement('input');

    /**
     * @private {!Element}
     */
    this.saveButton_ = document.createElement('button');

    /**
     * @private {!Element}
     */
    this.cancelButton_ = document.createElement('button');

    /**
     * @private {!goog.events.EventHandler<!EditModule>}
     */
    this.eventHandler_ = new goog.events.EventHandler(this);
  }

  /** @override */
  dispose() {
    this.eventHandler_.dispose();
  }

  /**
   * Initializes the module.
   */
  init() {
    this.eventHandler_.listen(this, ListModule.EventType.ITEM_SELECTED, (event) => {
      this.api_.getRecord(event.record.id).then((record) => {
        this.nameInput_.value = record.name;
        this.numberInput_.value = record.number;
        this.dateInput_.value = record.date.toISOString().substring(0, 10);
      });
    });

    this.saveButton_.textContent = 'Save';
this.eventHandler_.listen(this.saveButton_, goog.events.EventType.CLICK, () => {
  const record = {
    name: this.nameInput_.value,
    number: this.numberInput_.value,
    date: new Date(this.dateInput_.value),
  };
  this.api_.updateRecord(record).then(() => {
    alert('Record saved');
  });
});

this.cancelButton_.textContent = 'Cancel';
this.eventHandler_.listen(this.cancelButton_, goog.events.EventType.CLICK, () => {
  this.nameInput_.value = '';
  this.numberInput_.value = '';
  this.dateInput_.value = '';
});
}

/**

@return {!Element}
*/
getElement() {
goog.dom.classlist.add(this.element_, 'edit');
this.element_.appendChild(this.nameInput_);
this.element_.appendChild(this.numberInput_);
this.element_.appendChild(this.dateInput_);
this.element_.appendChild(this.saveButton_);
this.element_.appendChild(this.cancelButton_);
return this.element_;
}
}
exports = {
EditModule,
};

```javascript
/**
 * @fileoverview Main module for the app.
 */

goog.module('app');

const ListModule = goog.require('record.list');
const DetailModule = goog.require('record.detail');
const EditModule = goog.require('record.edit');
const api = goog.require('record.api');

/**
 * @implements {goog.disposable.IDisposable}
 */
class App {
  constructor() {
    /**
     * @private {!goog.ui.TabBar}
     */
    this.tabBar_ = new goog.ui.TabBar();

    /**
     * @private {!record.list.ListModule}
     */
    this.listModule_ = new ListModule(api);

    /**
     * @private {!record.detail.DetailModule}
     */
    this.detailModule_ = new DetailModule(api);

    /**
     * @private {!record.edit.EditModule}
     */
    this.editModule_ = new EditModule(api);

    /**
     * @private {!goog.events.EventHandler<!App>}
     */
    this.eventHandler_ = new goog.events.EventHandler(this);
  }

  /** @override */
  dispose() {
    this.tabBar_.dispose();
    this.listModule_.dispose();
    this.detailModule_.dispose();
    this.editModule_.dispose();
    this.eventHandler_.dispose();
  }

  /**
   * Initializes the app.
   */
  init() {
    this.tabBar_.addChild(new goog.ui.Tab('List', true));
    this.tabBar_.addChild(new goog.ui.Tab('Detail'));
    this.tabBar_.addChild(new goog.ui.Tab('Edit'));

    this.listModule_.init();
    this.detailModule_.init();
    this.editModule_.init();

    this.eventHandler_.listen(this.tabBar_, goog.ui.Component.EventType.SELECT, (event) => {
      const selectedIndex = this.tabBar_.getSelectedTabIndex();
      switch (selectedIndex) {
        case 0:
          this.listModule_.getElement().style.display = '';
          this.detailModule_.getElement().style.display = 'none';
          this.editModule_.getElement().style.display = 'none';
          break;
        case 1:
          this.listModule_.getElement().style.display = 'none';
          this.detailModule_.getElement().style.display = '';
          this.editModule_.getElement().style.display = 'none';
          break;
        case 2:
          this.listModule_.getElement().style.display = 'none';
          this.detailModule_.getElement().style.display = 'none';
          this.editModule_.getElement().style.display = '';
          break;
        default:
          break;
      }
    });

    const container = document.createElement('div');
    container.appendChild(this.tabBar_.getElement());
    container.appendChild(this.listModule_.getElement());
