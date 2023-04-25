'use strict';

(function() {
  var forgot = {};

  /******************* @desc page *******************/
  forgot.page = {};

  forgot.page.model = {
    $el: {}
  };

  forgot.page.view = {
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

  forgot.page.controller = {
    init: function() {
      this.init$el();
      this.initFormValidate();
      this.initEvents();
      this.initData();
    },
    init$el: function() {
      forgot.page.model.$el = {
        $card: $('.card'),
        $form: $('form')
      };
    },
    initFormValidate: function() {
      forgot.page.model.$el.$form.validate({
        rules: {
          password: {
            required: true,
            minlength: 6,
            maxlength: 100,
            nalphabets: 1
          },
          re_enter_password: {
            required: true,
            minlength: 6,
            maxlength: 100,
            custom: function(el) {
              const $form = $(el).closest('form');
              const data = $form.serializeObject();
              return data.password == data.re_enter_password;
            }
          }
        },
        messages: {
          re_enter_password: {
            custom: 'Re-enter password doesn\'t match with password'
          }
        },
        errorPlacement: (err, el) => $(el).parent('div').addClass('has-error').append(err)
      });
    },
    initEvents: function() {
      $('.btn-forgot').on('click', this.forgotController);
    },
    initData: function() {
      setTimeout(() => forgot.page.model.$el.$card.removeClass('card-hidden'), 1e2);

      forgot.page.view.setBackgroundImageView();
      if (window.hasOwnProperty('___notify')) {
        shareseye.notify.show(window.___notify);
        return;
      }
    },
    forgotController: function() {
      const $btn = $(this);
      if (forgot.page.model.$el.$form.valid()) {
        const formData = $('form').serializeObject();
        $.ajax({
          url: '/forgot',
          type: 'PUT',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          async: true,
          data: JSON.stringify({
            ...window.___data,
            password: btoa(formData.password)
          }),
          dataType: 'json',
          beforeSend: function() {
            $btn.prop('disabled', true).addClass('btn-primary-spin').text('Updating...');
          },
          success: function(data) {
            if (data.isSuccess) {
              shareseye.notify.show({
                icon: 'notifications',
                title: 'Password updated',
                message: '',
                type: 'primary',
                delay: 0,
                position: 'top',
                align: 'center',
                dismiss: true
              })
            }
          },
          error: function(_jqXHR, _textStatus) {

          },
          complete: function() {
            $btn.prop('disabled', false).removeClass('btn-primary-spin').text('Updated');
          }
        });
      }
    }
  };

  // on dom ready
  $(function() {

    // page
    forgot.page.controller.init();
  });
})();
