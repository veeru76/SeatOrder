'use strict';

(function() {
  var error = {};

  /******************* @desc page *******************/
  error.page = {};

  error.page.model = {
    $el: {}
  };

  error.page.view = {
    setBackgroundImageView: function() {

      // background image init
      const $page = $('.full-page');
      const image_src = $page.data('image');
      if (image_src !== undefined) {
        const html = `<div class="full-page-background" style="background-image: url(${image_src});"/>`;
        $page.append(html);
      }
    }
  };

  error.page.controller = {
    init: function() {
      this.init$el();
      this.initFormValidate();
      this.initEvents();
      this.initData();
    },
    init$el: function() {
      error.page.model.$el = {};
    },
    initFormValidate: function() {
    },
    initEvents: function() {
    },
    initData: function() {
      error.page.view.setBackgroundImageView();
      if (window.hasOwnProperty('___notify')) {
        shareseye.notify.show(window.___notify);
        return;
      }
    }
  };

  // on dom ready
  $(function() {

    // page
    error.page.controller.init();
  });
})();
