import $ from 'jquery';
global.$ = global.jQuery = $;

// Mock global alert function
global.alert = jest.fn();
