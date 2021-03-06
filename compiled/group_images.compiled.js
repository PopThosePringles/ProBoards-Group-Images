"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Group_Images = function () {
	function Group_Images() {
		_classCallCheck(this, Group_Images);
	}

	_createClass(Group_Images, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pd_group_images";
			this.PLUGIN_KEY = "pd_group_images";

			this.group_images = new Map();

			this.setup();

			if (this.group_images.size > 0) {
				$(this.ready.bind(this));
			}
		}
	}, {
		key: "ready",
		value: function ready() {
			var _this = this;

			var location_check = pb.data("route").name == "search_results" || pb.data("route").name == "conversation" || pb.data("route").name == "list_messages" || pb.data("route").name == "thread" || pb.data("route").name == "list_posts" || pb.data("route").name == "permalink" || pb.data("route").name == "all_recent_posts" || pb.data("route").name == "recent_posts" || pb.data("route").name == "posts_by_ip";

			if (location_check) {
				Group_Images_Mini_Profile.init();
			} else if (pb.data("route").name == "show_user_groups") {
				var member = pb.data("page").member;

				if (member && (member.id == pb.data("user").id || pb.data("user").is_staff)) {
					(function () {
						var $table = $("table.groups.list");
						var $rows = $table.find("tr.group");

						if ($table.length) {
							$table.find("tr.heading").append("<th>Group Images</th>");
						}

						var data = pb.plugin.key(_this.PLUGIN_KEY).get(member.id);

						if (!data) {
							data = {};
						}

						$rows.each(function (idx, elem) {
							var grp_id = elem.id.split("-")[1];
							var imgs = _this.fetch_group_images(grp_id, data, false);

							$(elem).append("<td>" + imgs + "</td>");
						});

						$rows.find(".group-img-selectable").on("click", _this.click_img);
					})();
				}
			}
		}
	}, {
		key: "in_group",
		value: function in_group($row) {
			var $td = $row.find("td:first");
			var a = $td.find("a.leave-group, a.remove-from-group");

			if (a.length > 0 && a.css("display") != "none") {
				return true;
			}

			return false;
		}
	}, {
		key: "click_img",
		value: function click_img() {
			var $img = $(this);
			var key = pb.plugin.key(Group_Images.PLUGIN_KEY);
			var $row = $img.parent().parent();

			if (!pb.data("user").is_staff && !Group_Images.in_group($row)) {
				return;
			}

			var grp_id = $row.attr("id").split("-")[1];
			var member = pb.data("page").member;
			var data = key.get(member.id);

			if (!data) {
				data = {};
			}

			if (!data["_" + grp_id]) {
				data["_" + grp_id] = [];
			}

			var img_indx = parseInt($img.attr("data-img-id"), 10);

			if ($img.hasClass("group-img-selected")) {
				$img.removeClass("group-img-selected");

				var index = $.inArrayLoose(img_indx, data["_" + grp_id]);

				if (index > -1) {
					data["_" + grp_id].splice(index, 1);
				}

				if (data["_" + grp_id].length == 0) {
					delete data["_" + grp_id];
				}
			} else {
				$img.addClass("group-img-selected");

				if ($.inArrayLoose(img_indx, data["_" + grp_id]) == -1) {
					data["_" + grp_id].push($img.attr("data-img-id"));
				}
			}

			key.set({

				value: data,
				object_id: member.id

			});
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				var plugin_settings = plugin.settings;
				var group_images = plugin_settings.group_images;

				for (var i = 0, l = group_images.length; i < l; ++i) {
					for (var g = 0, gl = group_images[i].groups.length; g < gl; ++g) {
						var grp = group_images[i].groups[g].toString();

						if (!this.group_images.has(grp)) {
							this.group_images.set(grp, []);
						}

						var imgs = this.group_images.get(grp);

						imgs.push(group_images[i].image_url);

						this.group_images.set(grp, imgs);
					}
				}
			}
		}
	}, {
		key: "fetch_group_images",
		value: function fetch_group_images() {
			var grp_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			var return_array = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

			var imgs = [];

			if (grp_id && this.group_images.has(grp_id.toString())) {
				var images = this.group_images.get(grp_id.toString());
				var grp_data = data["_" + grp_id] ? data["_" + grp_id] : [];

				for (var g = 0, l = images.length; g < l; ++g) {
					var klass = grp_data.length && $.inArrayLoose(g, grp_data) > -1 ? " group-img-selected" : "";

					if (return_array) {
						if ($.inArrayLoose(g, grp_data) > -1) {
							imgs.push(images[g]);
						}
					} else {
						imgs.push("<img data-img-id='" + g + "' class='group-img-selectable" + klass + "' src='" + images[g] + "' />");
					}
				}
			}

			return return_array ? imgs : imgs.join("<br />");
		}
	}]);

	return Group_Images;
}();

var Group_Images_Mini_Profile = function () {
	function Group_Images_Mini_Profile() {
		_classCallCheck(this, Group_Images_Mini_Profile);
	}

	_createClass(Group_Images_Mini_Profile, null, [{
		key: "init",
		value: function init() {
			this.add_group_images_to_mini_profile();

			pb.events.on("afterSearch", this.add_group_images_to_mini_profile.bind(this));
		}
	}, {
		key: "add_group_images_to_mini_profile",
		value: function add_group_images_to_mini_profile() {
			var $mini_profiles = $(".item .mini-profile");

			if (!$mini_profiles.length) {
				return;
			}

			$mini_profiles.each(function (index, item) {
				var $mini_profile = $(item);
				var $elem = $mini_profile.find(".group-images-mini-profile");
				var $user_link = $mini_profile.find("a.user-link[href*='user/']");
				var $info = $mini_profile.find(".info");

				if (!$elem.length && !$info.length) {
					return;
				}

				if ($user_link.length) {
					var user_id_match = $user_link.attr("href").match(/\/user\/(\d+)\/?/i);

					if (!user_id_match || !parseInt(user_id_match[1], 10)) {
						return;
					}

					var user_id = parseInt(user_id_match[1], 10);
					var using_info = false;

					if (!$elem.length) {
						using_info = true;
						$elem = $("<div class='group-images-mini-profile'></div>");
					}

					var data = pb.plugin.key(Group_Images.PLUGIN_KEY).get(user_id);

					if (data) {
						var user_grp_imgs = [];

						for (var group in data) {
							if (data.hasOwnProperty(group)) {
								var grp_id = parseInt(group.replace("_", ""), 10);
								var grp_imgs = Group_Images.fetch_group_images(grp_id, data, true);

								if (grp_imgs && grp_imgs.length) {
									user_grp_imgs.push({

										id: grp_id,
										imgs: grp_imgs

									});
								}
							}
						}

						if (user_grp_imgs.length) {
							var html = "";

							for (var i = 0, l = user_grp_imgs.length; i < l; ++i) {
								if (user_grp_imgs[i].imgs.length > 0) {
									for (var g = 0, gl = user_grp_imgs[i].imgs.length; g < gl; ++g) {
										html += "<span class='group-img-item'><a href='/members?group=" + user_grp_imgs[i].id + "&view=group'><img src='" + user_grp_imgs[i].imgs[g] + "' /></a></span>";
									}
								}
							}

							$elem.html(html);

							if (using_info) {
								$info.append($elem);
							}
						}
					}
				}
			});
		}
	}]);

	return Group_Images_Mini_Profile;
}();

;


Group_Images.init();