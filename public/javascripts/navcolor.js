/************************************************************
*
*  Company: Handytecmobi S.A.
*  Author: Andrés Caiza
*  Editor: Andrés Caiza
*  Last Update: 2018/09/24
*  Class Name: navcolor.js
*  Dependencies: jquery
*  Description: This class control the change of navbar color of the Webpage
*
************************************************************/

$(document).ready(function () {

  var menuActive =false;

  if ($(document).scrollTop() > 10) {
    $('#nav').addClass('shrink');
  }
  else {
    $('#nav').removeClass('shrink');
  }

  $(window).scroll(function () {
    if ($(document).scrollTop() > 10 || menuActive) {
      $('#nav').addClass('shrink');
    }
    else {
      $('#nav').removeClass('shrink');
    }
  });

  $('.navbar-collapse').on('show.bs.collapse', function () {
    $('#nav').addClass('shrink');
    menuActive=true;
  });

  $('.navbar-collapse').on('hide.bs.collapse', function () {
    if ($(document).scrollTop() < 10) {
      $('#nav').removeClass('shrink');
    }
    menuActive=false;
  });

  function fireTransition() {
    var a = $("input.search-input");
    (a.on("focus", function (a) {
      $("form.search").addClass("in-focus");
    }).on("blur", function (a) {
      $("form.search").removeClass("in-focus")
    }), $("form.search").on("mouseover", function (b) {
      $("form.search").hasClass("in-focus") || a.focus()
    }))
  };
  fireTransition();
});

