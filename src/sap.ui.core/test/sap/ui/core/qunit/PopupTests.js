jQuery.sap.require("sap.ui.core.Popup");
jQuery.sap.require("sap.m.Button");

jQuery.sap.require("sap.ui.qunit.QUnitUtils");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");
sinon.config.useFakeTimers = false;

var oDomRef;
var $Ref;
var oPopup = null;

// for Safari we need events to keep track of the focus
var lastFocusedId = null;
if (sap.ui.Device.browser.safari) {
	jQuery(document).focusin(function(oEvent){
		var target = oEvent.target;
		window.lastFocusedId = target.id;
	});
	jQuery(document).focusout(function(){
		window.lastFocusedId = null;
	});
}

QUnit.test("Initial Check", function(assert) {
	assert.ok((sap.ui.core.Popup !== undefined) && (sap.ui.core.Popup != null), "Popup class does not exist after being required");

	oDomRef = jQuery.sap.domById("popup");
	assert.ok((oDomRef !== undefined) && (oDomRef != null), "popup div not found");

	$Ref = jQuery.sap.byId("popup");
	assert.ok(($Ref !== undefined) && ($Ref != null), "popup jQuery object not found");
	assert.equal($Ref.size(), 1, "popup jQuery object has not exactly one item");
	assert.equal(oPopup, null, "oPopup must be null initially (order of execution problem?)");
});

QUnit.module("Basics", {
	beforeEach : function() {
		if (!this.oPopup) {
			this.oDomRef = jQuery.sap.domById("popup");
			this.oPopup = new sap.ui.core.Popup(this.oDomRef);
		}

		this.$Ref = jQuery.sap.byId("popup");
	}
});

QUnit.asyncTest("Open Popup", function(assert) {
	expect(7);

	var fnOpened = function() {
		this.oPopup.detachOpened(fnOpened, this);

		assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
		assert.equal(this.$Ref.css("display"), "block", "Popup should be 'display:block' after opening");
		assert.equal(this.$Ref.css("visibility"), "visible", "Popup should be 'visibility:visible' after opening");
		assert.equal(this.$Ref.css("opacity"), "1", "Popup should be 'opacity:1' after opening");
		start();
	};

	this.oPopup.attachOpened(fnOpened, this);
	assert.equal(this.oPopup.isOpen(), false, "Popup should not be open initially");
	assert.equal(this.$Ref.css("display"), "none", "Popup should be 'display:none' initially");
	assert.equal(this.$Ref.css("visibility"), "hidden", "Popup should be 'visibility:hidden' initially");
	this.oPopup.open();
});

QUnit.asyncTest("Close Popup", function(assert) {
	expect(3);

	var fnOpened = function() {
		this.oPopup.close(0);
	}
	var fnClosed = function() {
		this.oPopup.attachClosed(fnClosed);

		assert.equal(this.oPopup.isOpen(), false, "Popup should be closed after closing");
		assert.equal(this.$Ref.css("display"), "none", "Popup should be 'display:none' after closing");
		assert.equal(this.$Ref.css("visibility"), "hidden", "Popup should be 'visibility:hidden' after closing");
		start();
	};

	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.attachClosed(fnClosed, this);
	this.oPopup.open(0);
});

QUnit.module("Focus", {
	beforeEach : function() {
		if (!this.oPopup) {
			this.oDomRef = jQuery.sap.domById("popup");
			this.oPopup = new sap.ui.core.Popup(this.oDomRef);
		}

		this.$Ref = jQuery.sap.byId("popup");
	},

	// checks three elements in question and returns the focused one, if any - using the CSS color!
	getFocusedElementId : function() {
		if (sap.ui.Device.browser.safari) {
			// In Safari, the document cannot steal the focus from other parts of the browser. But we can keep track
			// of focus events:
			return lastFocusedId;
		} else {
			// Other browsers can get the focus into the document, at least as long as the window is on top
			var $activeElement = jQuery(document.activeElement);
			var sId = $activeElement.length > 0 ? $activeElement.get(0).id : null;
			if (sId === "focusableElement2" ||
					sId === "secondpopupcontent" ||
					sId === "popupcontent" ||
					sId === "popup") {

				return sId;

			} else {
				return null;
			}
		}
	}
})
QUnit.asyncTest("Initial Focus in non-modal mode, auto", function(assert) {
	expect(2);

	var fnOpened = function() {
		this.oPopup.detachOpened(fnOpened, this);

		assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
		// initial focus should be on first element
		assert.equal(this.getFocusedElementId(), null, "no element should be focused");

		this.oPopup.close();
	};
	var fnClosed = function() {
		this.oPopup.detachClosed(fnClosed, this);

		start();
	}

	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.attachClosed(fnClosed, this);
	this.oPopup.open();
});


QUnit.asyncTest("Initial Focus in non-modal mode, set", function(assert) {
	expect(2);

	var fnOpened = function() {
		this.oPopup.detachOpened(fnOpened, this);

		assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
		// initial focus should be on second element
		assert.equal(this.getFocusedElementId(), "secondpopupcontent", "second popup content element should be focused");

		this.oPopup.close();
		this.oPopup.setInitialFocusId(null);
	};
	var fnClosed = function() {
		this.oPopup.detachClosed(fnClosed, this);
		start();
	};

	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.attachClosed(fnClosed, this);
	this.oPopup.setInitialFocusId("secondpopupcontent");
	this.oPopup.open(50);
	sap.ui.getCore().applyChanges();
});


QUnit.asyncTest("Initial Focus in modal mode, auto", function(assert) {
	expect(2);

	var fnOpened = function() {
		this.oPopup.detachOpened(fnOpened, this);

		assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
		// initial focus should be on first element
		assert.equal(this.getFocusedElementId(), "popupcontent", "first popup content element should be focused");

		this.oPopup.close();
	};
	var fnClosed = function() {
		this.oPopup.detachClosed(fnClosed, this);
		start();
	}

	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.attachClosed(fnClosed, this);
	this.oPopup.setModal(true);
	this.oPopup.open();
});


QUnit.asyncTest("Initial Focus in modal mode, set", function(assert) {
	expect(2);

	var fnOpened = function() {
		this.oPopup.detachOpened(fnOpened, this);

		assert.equal(this.oPopup.isOpen(), true, "Popup should be open after opening");
		// initial focus should be on second element
		assert.equal(this.getFocusedElementId(), "secondpopupcontent", "second popup content element should be focused");

		this.oPopup.close();
		this.oPopup.setModal(false);
		this.oPopup.setInitialFocusId(null);
	};
	var fnClosed = function() {
		this.oPopup.detachClosed(fnClosed, this);
		start();
	}

	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.attachClosed(fnClosed, this);
	this.oPopup.setInitialFocusId("secondpopupcontent");
	this.oPopup.open();
});

QUnit.asyncTest("Check if focus is inside the Popup", function(assert) {
	expect(2);
	var oPopupDomRef = jQuery.sap.domById("popup"),
			oPopup = new sap.ui.core.Popup(oPopupDomRef),
			oButtonInside = jQuery.sap.domById("popupcontent"),
			oButtonOustide = jQuery.sap.domById("focusableElement");

	var fnOpened = function() {
		oPopup.detachOpened(fnOpened, this);

		oButtonInside.focus();
		assert.ok(this.oPopup._isFocusInsidePopup(), "Focus is inside the Popup");

		oButtonOustide.focus();
		assert.ok(!oPopup._isFocusInsidePopup(), "Focus is outside of the Popup");

		start();
	};

	// act
	oPopup.attachOpened(fnOpened, this);
	oPopup.open();
});

QUnit.module("Animation", {
	beforeEach : function() {
		if (!this.oPopup) {
			this.oDomRef = jQuery.sap.domById("popup");
			this.oPopup = new sap.ui.core.Popup(this.oDomRef);
		}

		this.$Ref = jQuery.sap.byId("popup");
	}
});

QUnit.test("Open Popup Without Animation", function(assert) {
	assert.expect(4);

	var done;
	if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version === 9) {
		// In IE9 the opened event is fired with timeout therefore async test has to be used for IE9
		done = assert.async();
	}

	var fnOpened = function() {
		this.oPopup.detachOpened(fnOpened, this);

		assert.equal(this.oPopup.isOpen(), true, "Popup should be immediately open after opening without animation");
		assert.equal(this.$Ref.css("display"), "block", "Popup should be immediately 'display:block' after opening without animation");
		assert.equal(this.$Ref.css("visibility"), "visible", "Popup should be immediately 'visibility:visible' after opening without animation");
		assert.equal(this.$Ref.css("opacity"), "1", "Popup should be immediately 'opacity:1' after opening without animation");

		if (done) {
			done();
		}
	};

	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.open(0);
});

QUnit.test("Close Popup Without Animation", function(assert) {
	assert.expect(3);

	var done;
	if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version === 9) {
		// In IE9 the opened event is fired with timeout therefore async test has to be used for IE9
		done = assert.async();
	}

	var fnOpened = function() {
		this.oPopup.detachOpened(fnOpened, this);

		this.oPopup.close(0);
	};
	var fnClosed = function() {
		this.oPopup.detachClosed(fnClosed, this);

		assert.equal(this.oPopup.isOpen(), false, "Popup should be closed immediately after closing without animation");
		assert.equal(this.$Ref.css("display"), "none", "Popup should be 'display:none' immediately after closing without animation");
		assert.equal(this.$Ref.css("visibility"), "hidden", "Popup should be 'visibility:hidden' immediately after closing without animation");

		if (done) {
			done();
		}
	};

	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.attachClosed(fnClosed, this);
	this.oPopup.open(0);
});

QUnit.asyncTest("Open Animation", function(assert) {
	expect(4);

	var fnOpened = function() {
		this.oPopup.detachOpened(fnOpened, this);

		start();
		this.oPopup.close(0);
	};

	var that = this;
	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.open(2000);

	setTimeout(function() {
		assert.equal(that.oPopup.isOpen(), true, "Popup should be 'open' while opening");
		assert.equal(that.$Ref.css("display"), "block", "Popup should be 'display:block' while opening");
		assert.equal(that.$Ref.css("visibility"), "visible", "Popup should be 'visibility:visible' while opening");
		var opacity = parseFloat(that.$Ref.css("opacity"));
		assert.ok((opacity>0.1 && opacity<0.9), "Popup opacity should be somewhere between 0.1 and 0.9 in the middle of the opening animation, but was: " + opacity);
	}, 1000);
});

QUnit.asyncTest("Closing Animation", function(assert) {
	expect(8);
	var fnOpened = function() {
			this.oPopup.detachOpened(fnOpened, this);

			var that = this;
			equal(this.$Ref.css("opacity"), "1", "Popup must be 'opacity:1' when open");
			this.oPopup.close(2000);

			setTimeout(function() {
				assert.equal(that.oPopup.isOpen(), true, "Popup should still be 'open' while closing");
				assert.equal(that.$Ref.css("display"), "block", "Popup should be 'display:block' while closing");
				assert.equal(that.$Ref.css("visibility"), "visible", "Popup should be 'visibility:visible' while closing");
				var opacity = parseFloat(that.$Ref.css("opacity"));
				assert.ok((opacity>0.1 && opacity<0.9), "Popup opacity should be somewhere between 0.1 and 0.9 in the middle of the closing animation, but was: " + opacity);
			}, 1000);
	};
	var fnClosed = function() {
		this.oPopup.detachClosed(fnClosed, this);

		assert.equal(this.oPopup.isOpen(), false, "Popup should not be 'open' after closing");
		assert.equal(this.$Ref.css("display"), "none", "Popup should be 'display:none' after closing");
		assert.equal(this.$Ref.css("visibility"), "hidden", "Popup should be 'visibility:hidden' after closing");
		start();
	};

	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.attachClosed(fnClosed, this);
	this.oPopup.open(0);
});

/*
 * Created internal BCP ticket: 1570771493
 */
// asyncTest("AutoClose (and setDurations)", function() {
// 	expect(7);
// 	var fnOpened = function() {
// 		this.oPopup.detachOpened(fnOpened, this);
//
// 		equal(this.oPopup.isOpen(), true, "Popup should be open before AutoClose");
// 		equal(this.$Ref.css("display"), "block", "Popup should be 'display:block' before AutoClose");
// 		equal(this.$Ref.css("visibility"), "visible", "Popup should be 'visibility:visible' before AutoClose");
//
// 		// jQuery.sap.domById("focusableElement2").focus(); // focus something else on the page
// 		var oFocusEvent = jQuery.Event("focus"),
// 			$focus = jQuery.sap.byId("focusableElement2");
// 		$focus.trigger(oFocusEvent);
// 		sap.ui.getCore().applyChanges();
// 	};
// 	var fnClosed = function() {
// 		this.oPopup.detachClosed(fnClosed, this);
//
// 		equal(this.oPopup.isOpen(), false, "Popup should be closed by AutoClose");
// 		equal(this.$Ref.css("display"), "none", "Popup should be made 'display:none' by AutoClose");
// 		equal(this.$Ref.css("visibility"), "hidden", "Popup should be made 'visibility:hidden' by AutoClose");
// 		equal(this.getFocusedElementId(), "focusableElement2", "the focused element should have the focus after autoclose");
// 		start();
// 	};
//
// 	this.oPopup.attachOpened(fnOpened, this);
// 	this.oPopup.attachClosed(fnClosed, this);
// 	this.oPopup.setAutoClose(true);
// 	this.oPopup.setDurations(0, 0);
// 	this.oPopup.open();
// });

// asyncTest("Modality", function() {
// 	var that = this;
// 	this.oPopup.setAutoClose(false);
// 	this.oPopup.setModal(true);
// 	jQuery.sap.domById("focusableElement2").focus(); // focus something else on the page
//
// 	setTimeout(function() {
// 		equal(this.getFocusedElementId(), "focusableElement2", "the focusable button should have the focus before modality tests");
// 		that.oPopup.open(); // duration is still 0
//
// 		jQuery.sap.domById("popupcontent").focus(); // focus something in the popup
// 		setTimeout(function() {
//   		equal(this.getFocusedElementId(), "popupcontent", "popupcontent should be focused now");
//
//   		jQuery.sap.domById("secondpopupcontent").focus(); // focus something else in the popup
//   		setTimeout(function() {
// 	  		equal(this.getFocusedElementId(), "secondpopupcontent", "secondpopupcontent should be focused now");
//
// 	  		jQuery.sap.domById("focusableElement2").focus(); // focus something else
// 	  		setTimeout(function() {
// 		  		equal(this.getFocusedElementId(), "secondpopupcontent", "secondpopupcontent should again be focused after an attempt to focus the background");
//
// 		  		equal(that.oPopup.isOpen(), true, "Popup should still be open after testing modality");
// 		  		that.oPopup.close();
// 		  		setTimeout(function() {
// 		  			equal(this.getFocusedElementId(), "focusableElement2", "the focusable button should have the focus back after modality tests");
// 		  			start();
// 		  		}, 100);
// 	  		}, 100);
//   		}, 100);
// 		}, 100);
// 	}, 100);
// });

QUnit.module("Event", {
	beforeEach : function() {
		if (!this.oPopup) {
			this.oDomRef = jQuery.sap.domById("popup");
			this.oPopup = new sap.ui.core.Popup(this.oDomRef);
		}

		this.$Ref = jQuery.sap.byId("popup");
	}
});

QUnit.asyncTest("Opened / closed", function(assert) {
	expect(2);
	var fnOpened = function(oEvent) {
		this.oPopup.detachOpened(fnOpened, this);

		assert.equal(oEvent.sId, "opened", "the last event should have been 'opened'");
		this.oPopup.close();
	};
	var fnClosed = function(oEvent) {
		this.oPopup.detachClosed(fnClosed, this);

		assert.equal(oEvent.sId, "closed", "the last event should have been 'closed'");
		start();
	}
	this.oPopup.setDurations(0, 20);
	this.oPopup.attachOpened(fnOpened, this);
	this.oPopup.attachClosed(fnClosed, this);
	this.oPopup.open();
});

// // opening is triggered in this test but will not complete, so the event will only be raised in the next test
// test("Event: opened event only AFTER opening, part 1",0, function() {
// 	this.oPopup.setDurations(200, 100);
// 	this.oPopup.open();
// });
//
// // this test captures the event caused by opening the popup in the last test
// asyncTest("Event: opened event only AFTER opening, part 2", function() {
// 	expect(3);
// 	setTimeout(function() {
// 		equal(lastEvent, "closed", "the last event should be 'closed' because 'opened' must not be raised yet");
// 		setTimeout(function() {
//   			equal(lastEvent, "opened", "'opened' must have been raised last - coming in from the previous test call");
//   			start();
// 		}, 120);
// }, 100);
// });

// asyncTest("Event: closed event only AFTER closing", function() { // kept simpler for closing...
// 	expect(3); // including the event handler
// 	this.oPopup.close();
//
// 	setTimeout(function() {
// 		equal(lastEvent, "opened", "the last event should still be 'opened' because 'closed' must not be raised yet");
// 		setTimeout(function() {
// 			equal(lastEvent, "closed", "the last event must now be 'closed' because the popup has closed in the meanwhile");
// 			start();
// 		}, 100);
// }, 50);
// });

QUnit.module("Parent / Child Popups", {
	setup : function() {
		this.oChildOpener = jQuery.sap.domById("popup2-btn");

		oDomRef = jQuery.sap.domById("popup");
		this.oChildPop = new sap.ui.core.Popup(oDomRef);

		oDomRef =jQuery.sap.domById("popup2");
		this.oParentPop = new sap.ui.core.Popup(oDomRef);
	},

	teardown : function() {
		delete this.oChildOpener;
		this.oChildPop.destroy();

		this.oParentPop.destroy();
	}
});

QUnit.asyncTest("Autoclose popup opened from another autoclose popup", function(assert) {
	var oPopup1DomRef = jQuery.sap.domById("popup1"),
			oPopup2DomRef = jQuery.sap.domById("popup2"),
			oPopup1 = new sap.ui.core.Popup(oPopup1DomRef),
			oPopup2 = new sap.ui.core.Popup(oPopup2DomRef);

	oPopup1.setAutoClose(true);
	oPopup1.setPosition(sap.ui.core.Popup.Dock.CenterCenter, sap.ui.core.Popup.Dock.CenterCenter, window, "0 0", "fit");
	oPopup1.setDurations(0, 0);
	oPopup1.open();
	assert.ok(oPopup1.isOpen(), "Popup1 is open");

	var oButtonRef = jQuery.sap.domById("popup1-btn");

	oPopup2.setAutoClose(true);
	oPopup2.setPosition(sap.ui.core.Popup.Dock.RightCenter, sap.ui.core.Popup.Dock.LeftCenter, oButtonRef, "0 0", "fit");
	oPopup2.setDurations(0, 0);
	oPopup2.open();
	assert.ok(oPopup2.isOpen(), "Popup2 is open");

	jQuery.sap.domById("focusableElement").focus();
	setTimeout(function() {
		assert.ok(!oPopup1.isOpen(), "Popup1 is closed");
		assert.ok(!oPopup2.isOpen(), "Popup2 is closed");
		oPopup1.destroy();
		oPopup2.destroy();
		start();
	}, 200);
});

QUnit.asyncTest("Child registered at parent", function(assert) {
	that = this;

	fnParentOpened = function() {
		that.oParentPop.detachOpened(fnParentOpened);
		that.oChildPop.open(0, sap.ui.core.Popup.Dock.BeginTop, sap.ui.core.Popup.Dock.BeginBottom, that.oChildOpener, "0 0", "fit");
	};

	fnChildOpened = function() {
		that.oChildPop.detachOpened(fnChildOpened);

		assert.ok(that.oChildPop.isInPopup(that.oChildPop._oPosition.of), "Child belongs to parent");
		assert.ok(that.oParentPop.getChildPopups().length, "Parent got child");

		that.oChildPop.close(0);
	};

	fnChildClosed = function() {
		that.oChildPop.detachClosed(fnChildClosed);

		assert.ok(!that.oParentPop.getChildPopups().length, "Parent has no child");

		start();
	};

	this.oParentPop.attachOpened(fnParentOpened);
	this.oChildPop.attachOpened(fnChildOpened);
	this.oChildPop.attachClosed(fnChildClosed);
	this.oParentPop.open();
});

QUnit.asyncTest("Increase z-index: Child must not be re-rendered", function(assert) {
	var oDelegate = {
		onBeforeRendering : function() {}
	}
	this.oRenderingStub = sinon.stub(oDelegate, "onBeforeRendering");

	var oButton = new sap.m.Button({
		text : "Sis is se dschaild"
	}).addDelegate(oDelegate, this);
	var oChildPop = new sap.ui.core.Popup(oButton);

	// Create some stubs to check if and how many times the functions were called
	this.oMouseSpy = sinon.spy(this.oParentPop, "onmousedown");

	var fnGetZIndexFromDomRef = function(oDomRef) {
		if (oDomRef) {
			return parseInt(jQuery(oDomRef).css("z-index"), 10);
		} else {
			return -1;
		}
	}

	var fnParentOpened = function() {
		this.oParentPop.detachOpened(fnParentOpened);

		oChildPop.open(0, sap.ui.core.Popup.Dock.BeginTop, sap.ui.core.Popup.Dock.BeginBottom, this.oChildOpener, "0 0", "fit");
	}.bind(this);

	var fnChildOpened = function() {
		oChildPop.detachOpened(fnParentOpened);
		start();

		assert.equal(this.oRenderingStub.callCount, 1, "'onBeforeRendering' should have been called once for rendering for child");

		var oDomRef = this.oParentPop._$(/*bForceReRender*/ false, /*bGetOnly*/ true);
		var iParentOldIndex = fnGetZIndexFromDomRef(oDomRef);
		oDomRef = oChildPop._$(/*bForceReRender*/ false, /*bGetOnly*/ true);
		var iChildOldIndex = fnGetZIndexFromDomRef(oDomRef);
		assert.ok(iParentOldIndex < iChildOldIndex, "Child should have a bigger z-index that its parent");

		qutils.triggerMouseEvent(this.oParentPop, "onmousedown", /*iOffsetX*/0, /*iOffsetY*/0, /*iPageX*/0, /*iPageY*/0, /*Button left*/0);
		assert.equal(this.oMouseSpy.callCount, 1, "'onmousedown' should have been called at parent Popup");

		oDomRef =  this.oParentPop._$(/*bForceReRender*/ false, /*bGetOnly*/ true);
		var iParentNewIndex = fnGetZIndexFromDomRef(oDomRef);
		oDomRef = oChildPop._$(/*bForceReRender*/ false, /*bGetOnly*/ true);
		var iChildNewIndex = fnGetZIndexFromDomRef(oDomRef);
		assert.ok(iParentNewIndex < iChildNewIndex, "Child should still have a bigger z-index that its parent");
		assert.ok(iChildOldIndex < iChildNewIndex, "Child z-index should have been increased");
		assert.ok(iParentOldIndex < iParentNewIndex, "Parent z-index should have been increased");

		assert.equal(this.oRenderingStub.callCount, 1, "'onBeforeRendering' shouldn't have been called after increasing the z-index for child");
	}.bind(this);

	this.oParentPop.attachOpened(fnParentOpened);
	oChildPop.attachOpened(fnChildOpened);
	this.oParentPop.open();
});

QUnit.module("Special cases and combinations");

QUnit.test("Close a popup without opening animation in 'opened' event handler", function(assert) {
	var oPopupDomRef = jQuery.sap.domById("popup"),
		oPopup = new sap.ui.core.Popup(oPopupDomRef),
		fnOpened = function() {
			oPopup.detachOpened(fnOpened);
			oPopup.close();
		};

	oPopup.setDurations(0, 0);
	oPopup.attachOpened(fnOpened);
	oPopup.open();

	assert.equal(oPopup.getOpenState(), sap.ui.core.OpenState.CLOSED, "Popup state is CLOSED");
	assert.ok(!oPopup.isOpen(), "isOpen method returns the correct state.");
});
