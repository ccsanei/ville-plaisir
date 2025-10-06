"use strict";

if (tarteaucitron) {
  var cookiesToObject = function cookiesToObject(cookies) {
    return cookies
        .split("!")
        .filter(function (cookie) {
          return cookie !== "";
        })
        .reduce(function (current, next) {
          var nextSplit = next.split("="),
              key = nextSplit[0],
              value = nextSplit[1];
          current[key] = value;
          return current;
        }, {});
  };

  var handleFancyboxServiceCookies = function handleFancyboxServiceCookies() {
    var cookies = cookiesToObject(tarteaucitron.cookie.read());

    if (
        cookies.youtube === "false" ||
        cookies.vimeo === "false" ||
        cookies.dailymotion === "false"
    ) {
      tarteaucitron.cookie.create("fancybox", false);
    }
  };

  tarteaucitron.services.fancybox = {
    key: "fancybox",
    type: "video",
    name: "FancyboxService",
    needConsent: true,
    cookies: [],
    js: function js() {},
    fallback: function fallback() {
      tarteaucitron.fallback(
          ["js-fancybox-check-cookies"],
          function (item) {
            var id = item.href.match(/youtube|youtu|vimeo|dailymotion/gi);

            if (id) {
              if (id[0] === "youtu") {
                id[0] = "youtube";
              }

              var service = id[0];
              var cookies = cookiesToObject(tarteaucitron.cookie.read());

              if (cookies[service] === "true") {
                return item;
              }

              var itemToPaste = document.createElement("button");
              var tempNode = document.createElement("div");
              tempNode.innerHTML = tarteaucitron.engage(service);
              var childNodes = tempNode.querySelector(".tac_float").childNodes;
              var text = childNodes[0];
              var button = childNodes[1];
              itemToPaste.className = ""
                  .concat(button.className, " ")
                  .concat(item.className, " cookies-denied");
              itemToPaste.id = button.id;
              itemToPaste.innerHTML = "";
              itemToPaste.appendChild(text);
              itemToPaste.innerHTML = "<span>".concat(
                  itemToPaste.innerHTML.trim(),
                  "</span>"
              );
              itemToPaste.setAttribute("type", "button");
              item.parentElement.replaceChild(itemToPaste, item);
              itemToPaste.addEventListener("click", function (e) {
                e.preventDefault();
                location.reload();
              });
              var galleryList = itemToPaste.classList.contains("gallery-item")
                  ? itemToPaste.parentElement.parentElement
                  : itemToPaste.parentElement;
              var haveLinks = galleryList.querySelector("a");
              var hasBlockedElements = galleryList.querySelector("button");

              if (!haveLinks) {
                galleryList.classList.add("no-links");
              }

              if (hasBlockedElements) {
                galleryList.classList.add("has-blocked-elements");
              }

              return itemToPaste;
            }
          },
          true
      );
    }
  };
  tarteaucitron.reloadThePage = true;
  tarteaucitron.events.load = handleFancyboxServiceCookies;
  window.addEventListener("tac.root_available", function () {
    var CTAButtons = [].slice.call(
        document.querySelectorAll(".tarteaucitronCTAButton")
    );
    CTAButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        location.reload();
      });
    });
  });
}

window.addEventListener("tac.close_panel", handleFancyboxServiceCookies);
setTimeout(function () {
  var personalize = document.querySelector("#tarteaucitronPersonalize");

  if (!personalize) {
    return;
  }

  personalize.addEventListener("click", function () {
    if (jQuery && jQuery.fancybox) {
      jQuery.fancybox.close();
    }
  });
}, 2000);

if (tarteaucitron.job.length) {
  var serviceAllowButtonsHandler = function serviceAllowButtonsHandler() {
    var tacRoot = document.getElementById("tarteaucitronRoot");
    var allowButtons = [].slice
        .call(document.querySelectorAll(".tarteaucitronAllow:not(.has-listener)"))
        .filter(function (item) {
          return item && !tacRoot.contains(item);
        });
    allowButtons.forEach(function (button) {
      button.classList.add("has-listener");
      button.addEventListener("click", function () {
        location.reload();
      });
    });
  };

  tarteaucitron.job.forEach(function (serviceName) {
    document.addEventListener(
        "".concat(serviceName, "_added"),
        serviceAllowButtonsHandler
    );
  });
}
