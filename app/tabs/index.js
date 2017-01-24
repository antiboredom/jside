var Path = nodeRequire('path');
var fs = nodeRequire('fs');
var trash = nodeRequire('trash');

var File = require('./../files');
var _ = require('underscore');
var $ = require('jquery');

module.exports = {
	template: require('./template.html'),

	components: {
		tab: {
			template: require('./tab.html'),
			computed: {
				hidden: function() {
					return this.name[0] === '.'
				},
				className: function() {
					var c = '';
					if (this.$root.currentFile == this.file) c += 'selected';
					return c;
				}
			},

			methods: {

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
		},
	},

	ready: function() {
		this.$on('add-tab', this.addTab);
		this.$on('close-file', this.closeFile);


	},
};