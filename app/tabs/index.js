var Path = nodeRequire('path');
var fs = nodeRequire('fs');
var trash = nodeRequire('trash');

var File = require('./../files');
var _ = require('underscore');
var $ = require('jquery');

module.exports = {
	name: 'Tabs',
	template: require('./template.html'),
	props: ['tabs'],

	components: {
		tab: {
			name: 'Tab',
			template: require('./tab.html'),
			props: ['path', 'name', 'file'],
			computed: {
				hidden: function() {
					return this.name[0] === '.';
				},
				editing: function() {
					return this.file.contents !== this.file.lastSavedContents ? '*' : '';
				},
				selected: function() {
					return this.$root.currentFile === this.file;
				}
			}
		}
	},

	methods: {
		closeFile: function(fileObject) {
			var tabs = this.$root.tabs;
			var target_tabs = tabs.filter(function(tab) {
				return tab.name === fileObject.name;
			});
			if (target_tabs[0]) {
				var newTarget;
				var index = _.indexOf(tabs, target_tabs[0]);

				switch (index) {
					case 0:
						newTarget = 0;
						break;
					case tabs.length - 1:
						newTarget = tabs.length - 2;
						break;
					default:
						newTarget = index - 1;
						break;
				}
					tabs.splice(index, 1);
					this.$root.openFile(tabs[newTarget].path);
			}
		},

		addTab: function(fileObject, tabs) {
			if (fileObject.open) {
				var tabObject = {
					name: fileObject.name,
					path: fileObject.path,
					id: fileObject.path,
					type: 'file',
					open: true,
					file: fileObject
				};

				tabs.push(tabObject);
			}
		}
	},

	events: {
		'add-tab': 'addTab',
		'close-file': 'closeFile'
	}

};
