(function () {
  'use strict';

  // ==========================================
  //  Dish Data
  // ==========================================

  var dishes = {
    smash: {
      num: '01', tag: 'Signature', name: 'The Classic Smash', priceNum: 14, category: 'burgers',
      short: 'Aged cheddar, butter lettuce, house relish',
      desc: 'Two thin, lacy-edged patties seared on cast iron, aged cheddar melted to the griddle, butter lettuce and our house relish on a toasted brioche bun.',
      calories: '740', spice: 'Mild', prep: '12′',
      ingredients: ['Brioche bun', 'Smash patty ×2', 'Aged cheddar', 'Butter lettuce', 'Vine tomato', 'House relish'],
      allergens: ['Gluten', 'Dairy', 'Sesame', 'Egg'],
      rating: '4.8', reviewCount: '212',
      reviews: [
        { q: '“Best smash in the city — full stop.”', a: 'Dana R.' },
        { q: '“The 3D view sold me before I tasted it.”', a: 'Marcus T.' }
      ],
      model: 'models/burger.glb'
    },
    hotdog: {
      num: '02', tag: 'Stadium classic', name: 'The Hotdog Burger', priceNum: 15, category: 'burgers',
      short: 'Smash patty, beef frank, crispy onions',
      desc: 'A smash patty and a snapping all-beef frank stacked on one toasted bun — American cheese, crispy onions, dill pickles and a stripe of yellow mustard.',
      calories: '780', spice: 'Mild', prep: '12′',
      ingredients: ['Toasted bun', 'Smash patty', 'All-beef frank', 'American cheese', 'Crispy onions', 'Dill pickles', 'Yellow mustard'],
      allergens: ['Gluten', 'Dairy', 'Mustard'],
      rating: '4.6', reviewCount: '74',
      reviews: [
        { q: '“Two cravings, one bun. Genius.”', a: 'Priya N.' },
        { q: '“The frank actually snaps.”', a: 'Cole B.' }
      ],
      model: 'models/hotdog burger.glb'
    },
    parma: {
      num: '03', tag: 'House favourite', name: 'Chicken Parma Puff', priceNum: 16, category: 'burgers',
      short: 'Crumbed chicken, Napoli, mozzarella',
      desc: 'Crumbed chicken parmigiana wrapped in golden puff pastry — Napoli sauce, melted mozzarella and shaved parmesan baked until the crust crackles.',
      calories: '690', spice: 'Mild', prep: '15′',
      ingredients: ['Puff pastry', 'Crumbed chicken', 'Napoli sauce', 'Mozzarella', 'Shaved parmesan', 'Fresh basil'],
      allergens: ['Gluten', 'Dairy', 'Egg'],
      rating: '4.9', reviewCount: '138',
      reviews: [
        { q: '“Parma meets pastry — just order it.”', a: 'Renee K.' },
        { q: '“Flaky outside, molten inside.”', a: 'Sam D.' }
      ],
      model: 'models/Chicken parma puff.glb'
    },
    garlic: {
      num: '01', tag: 'To share', name: 'Garlic Bread', priceNum: 7, category: 'sides',
      short: 'Roasted garlic butter, parsley',
      desc: 'Stone-baked ciabatta brushed with roasted garlic butter and parsley, torn into shareable pieces with a golden, crackly crust.',
      calories: '420', spice: 'None', prep: '8′',
      ingredients: ['Ciabatta', 'Roasted garlic butter', 'Fresh parsley', 'Sea salt'],
      allergens: ['Gluten', 'Dairy'],
      rating: '4.8', reviewCount: '201',
      reviews: [
        { q: '“Order two. Trust me.”', a: 'Will T.' },
        { q: '“Buttery, garlicky, gone in seconds.”', a: 'Maya F.' }
      ],
      model: 'models/garlic bread.glb'
    },
    banana: {
      num: '02', tag: 'Kids menu', name: 'Banana (Kids Side)', priceNum: 3, category: 'sides',
      short: 'Fresh banana — a little side for the little ones',
      desc: 'A perfectly ripe banana served whole — the classic healthy side for our younger guests. Simple, sweet, and always a hit.',
      calories: '105', spice: 'None', prep: '1′',
      ingredients: ['Fresh banana'],
      allergens: [],
      rating: '4.9', reviewCount: '89',
      reviews: [
        { q: '“My toddler asks for this every time.”', a: 'Sarah L.' },
        { q: '“Love that there\'s a healthy kids option.”', a: 'James W.' }
      ],
      model: 'models/banana.glb'
    }
  };

  var dishOrder = ['smash', 'hotdog', 'parma', 'garlic', 'banana'];
  var catLabels = { burgers: 'Burgers', sides: 'Sides' };
  var catSubtitles = { burgers: 'Cast-iron smash, never frozen.', sides: 'Made to share. Or not.' };

  function dishesInCategory(cat) {
    return dishOrder.filter(function (id) { return dishes[id].category === cat; });
  }

  // ==========================================
  //  State
  // ==========================================

  var state = {
    screen: 'home',
    category: 'burgers',
    dishId: 'smash',
    ar: false,
    qty: 1,
    fries: false,
    shake: false,
    cart: []
  };

  var $ = function (sel) { return document.querySelector(sel); };

  // ==========================================
  //  Helpers
  // ==========================================

  function money(n) {
    return '$' + (Number.isInteger(n) ? n : n.toFixed(2));
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================
  //  State management
  // ==========================================

  function setState(updates) {
    var prevDishId = state.dishId;
    var prevScreen = state.screen;
    Object.keys(updates).forEach(function (k) { state[k] = updates[k]; });

    if (state.dishId !== prevDishId) {
      loadModel(dishes[state.dishId].model);
      updateARModelViewer();
    }

    cleanupMenuThumbs();
    render();

    if (state.screen === 'home' && prevScreen !== 'home') {
      ensureHomeViewer();
    }
  }

  function selectDish(id) {
    setState({ screen: 'detail', ar: false, dishId: id, qty: 1, fries: false, shake: false });
  }

  function addToCart() {
    var dish = dishes[state.dishId];
    var showPairings = dish.category === 'burgers';

    var existing = null;
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].dishId === state.dishId) { existing = state.cart[i]; break; }
    }

    if (existing) {
      existing.qty += state.qty;
      if (showPairings) {
        existing.fries = existing.fries || state.fries;
        existing.shake = existing.shake || state.shake;
      }
    } else {
      state.cart.push({
        dishId: state.dishId,
        qty: state.qty,
        fries: showPairings ? state.fries : false,
        shake: showPairings ? state.shake : false
      });
    }

    setState({ screen: 'cart', ar: false, qty: 1, fries: false, shake: false });
  }

  function removeFromCart(index) {
    state.cart.splice(index, 1);
    if (state.cart.length === 0) {
      setState({ screen: 'menu', category: 'burgers' });
    } else {
      setState({});
    }
  }

  // ==========================================
  //  AR model-viewer
  // ==========================================

  function updateARModelViewer() {
    var mv = document.getElementById('ar-model-viewer');
    if (!mv) return;
    var dish = dishes[state.dishId];
    mv.setAttribute('src', dish.model);
  }

  function tryNativeAR() {
    var mv = document.getElementById('ar-model-viewer');
    if (mv && mv.canActivateAR) {
      mv.activateAR();
      return true;
    }
    return false;
  }

  // ==========================================
  //  Rendering
  // ==========================================

  function render() {
    var dish = dishes[state.dishId];
    var showPairings = dish.category === 'burgers';
    var addons = showPairings ? (state.fries ? 5 : 0) + (state.shake ? 6 : 0) : 0;
    var base = dish.priceNum;

    // -- screens visibility --
    var detailEl = $('#screen-detail');
    if (state.screen === 'detail') {
      detailEl.classList.remove('inactive');
    } else {
      detailEl.classList.add('inactive');
    }

    showScreen('screen-home', state.screen === 'home');
    showScreen('screen-menu', state.screen === 'menu');
    showScreen('screen-cart', state.screen === 'cart');
    showScreen('screen-ar', state.ar);

    // -- detail content --
    $('#detail-category-label').textContent = catLabels[dish.category] || '';
    $('#detail-num').textContent = dish.num;
    $('#detail-tag').textContent = dish.tag;
    $('#detail-name').textContent = dish.name;
    $('#detail-desc').textContent = dish.desc;
    $('#detail-calories').textContent = dish.calories;
    $('#detail-spice').textContent = dish.spice;
    $('#detail-prep').textContent = dish.prep;
    $('#detail-rating').textContent = dish.rating;
    $('#detail-review-count').textContent = '(' + dish.reviewCount + ')';

    var ingEl = $('#detail-ingredients');
    ingEl.innerHTML = '';
    dish.ingredients.forEach(function (ing) {
      var span = document.createElement('span');
      span.className = 'ingredient-pill';
      span.textContent = ing;
      ingEl.appendChild(span);
    });

    var alEl = $('#detail-allergens');
    alEl.innerHTML = '';
    dish.allergens.forEach(function (al) {
      var span = document.createElement('span');
      span.className = 'allergen-pill';
      span.innerHTML = '<span class="allergen-dot"></span>' + escapeHtml(al);
      alEl.appendChild(span);
    });

    $('#pairings-section').style.display = showPairings ? '' : 'none';

    var revEl = $('#detail-reviews');
    revEl.innerHTML = '';
    dish.reviews.forEach(function (rv) {
      var div = document.createElement('div');
      div.className = 'review-item';
      div.innerHTML = '<div class="review-quote">' + escapeHtml(rv.q) + '</div><div class="review-author">' + escapeHtml(rv.a) + '</div>';
      revEl.appendChild(div);
    });

    $('#qty-display').textContent = state.qty;
    $('#add-total').textContent = money(base * state.qty + addons);

    var friesBtn = $('#btn-fries');
    friesBtn.textContent = state.fries ? '✓' : '+';
    friesBtn.classList.toggle('active', state.fries);
    var shakeBtn = $('#btn-shake');
    shakeBtn.textContent = state.shake ? '✓' : '+';
    shakeBtn.classList.toggle('active', state.shake);

    // -- menu --
    renderMenuList();

    $('#menu-pill-burgers').classList.toggle('pill-active', state.category === 'burgers');
    $('#menu-pill-sides').classList.toggle('pill-active', state.category === 'sides');
    $('#menu-title').textContent = catLabels[state.category] || '';
    $('#menu-subtitle').textContent = catSubtitles[state.category] || '';
    var items = dishesInCategory(state.category);
    $('#menu-count').textContent = items.length + ' item' + (items.length !== 1 ? 's' : '');

    // -- cart --
    renderCart();

    // -- AR --
    $('#ar-dish-name').innerHTML = escapeHtml(dish.name) + ' <span class="ar-life-sized">— life-sized</span>';
  }

  function showScreen(id, visible) {
    var el = document.getElementById(id);
    if (visible) {
      el.classList.remove('screen-hidden');
    } else {
      el.classList.add('screen-hidden');
    }
  }

  // ==========================================
  //  Menu Thumbnails
  // ==========================================

  var menuThumbScenes = {};

  function renderMenuList() {
    var listEl = $('#menu-list');
    var items = dishesInCategory(state.category);
    listEl.innerHTML = '';

    items.forEach(function (id) {
      var d = dishes[id];
      var div = document.createElement('div');
      div.className = 'menu-item';
      div.innerHTML =
        '<div class="menu-item-thumb"><canvas data-menu-thumb="' + id + '"></canvas></div>' +
        '<div class="menu-item-body">' +
          '<div class="menu-item-top"><span class="menu-item-num">' + escapeHtml(d.num) + '</span><span class="menu-item-name">' + escapeHtml(d.name) + '</span></div>' +
          '<div class="menu-item-short">' + escapeHtml(d.short) + '</div>' +
          '<span class="menu-item-badge">&#9679; 3D ready</span>' +
        '</div>' +
        '<div class="menu-item-price">$' + d.priceNum + '</div>';
      div.addEventListener('click', function () { selectDish(id); });
      listEl.appendChild(div);
    });

    if (state.screen === 'menu') {
      requestAnimationFrame(function () {
        items.forEach(function (id) { initMenuThumb(id); });
      });
    }
  }

  function initMenuThumb(dishId) {
    var canvas = document.querySelector('[data-menu-thumb="' + dishId + '"]');
    if (!canvas || menuThumbScenes[dishId]) return;

    var THREE = window.THREE;
    if (!THREE || !THREE.GLTFLoader) return;

    var w = canvas.clientWidth || 70;
    var h = canvas.clientHeight || 70;
    if (w === 0 || h === 0) return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, w / h, 0.01, 100);
    camera.position.set(0, 0.3, 3.5);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w, h, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    setupLighting(THREE, scene);
    setupEnvironment(THREE, scene, renderer);

    var pivot = new THREE.Group();
    scene.add(pivot);

    var dish = dishes[dishId];
    new THREE.GLTFLoader().load(dish.model, function (gltf) {
      var model = gltf.scene;
      fixMaterials(THREE, model);
      autoFrame(THREE, model, pivot, 2.0);
    }, undefined, function (e) { console.warn('[thumb] load failed:', dishId, e); });

    var rotY = Math.random() * 6;
    var raf;
    var loop = function () {
      raf = requestAnimationFrame(loop);
      rotY += 0.008;
      pivot.rotation.y = rotY;
      pivot.rotation.x = 0.14;
      renderer.render(scene, camera);
    };
    loop();
    menuThumbScenes[dishId] = { raf: raf, renderer: renderer };
  }

  function cleanupMenuThumbs() {
    Object.keys(menuThumbScenes).forEach(function (id) {
      var s = menuThumbScenes[id];
      if (s.raf) cancelAnimationFrame(s.raf);
      if (s.renderer) { try { s.renderer.dispose(); } catch (e) {} }
    });
    menuThumbScenes = {};
  }

  // ==========================================
  //  Cart rendering (accumulating)
  // ==========================================

  function renderCart() {
    var itemsEl = $('#cart-items');
    var totalsEl = $('#cart-totals');

    if (state.cart.length === 0) {
      itemsEl.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
      totalsEl.innerHTML = '';
      $('#checkout-total').textContent = '$0';
      return;
    }

    itemsEl.innerHTML = '';
    var subtotal = 0;

    state.cart.forEach(function (cartItem, idx) {
      var dish = dishes[cartItem.dishId];
      var lineTotal = dish.priceNum * cartItem.qty;
      subtotal += lineTotal;

      var div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML =
        '<div class="cart-item-thumb"></div>' +
        '<div class="cart-item-info"><div class="cart-item-name">' + escapeHtml(dish.name) + '</div><div class="cart-item-sub">Qty ' + cartItem.qty + '</div></div>' +
        '<div class="cart-item-price">' + money(lineTotal) + '</div>' +
        '<button class="cart-item-remove" data-cart-idx="' + idx + '">×</button>';
      itemsEl.appendChild(div);

      if (cartItem.fries) {
        subtotal += 5;
        var friesDiv = document.createElement('div');
        friesDiv.className = 'cart-item';
        friesDiv.innerHTML =
          '<div class="cart-item-thumb striped"></div>' +
          '<div class="cart-item-info"><div class="cart-item-name">Hand-cut fries</div><div class="cart-item-sub">Add-on</div></div>' +
          '<div class="cart-item-price">$5</div>';
        itemsEl.appendChild(friesDiv);
      }

      if (cartItem.shake) {
        subtotal += 6;
        var shakeDiv = document.createElement('div');
        shakeDiv.className = 'cart-item';
        shakeDiv.innerHTML =
          '<div class="cart-item-thumb striped"></div>' +
          '<div class="cart-item-info"><div class="cart-item-name">Salted malt shake</div><div class="cart-item-sub">Add-on</div></div>' +
          '<div class="cart-item-price">$6</div>';
        itemsEl.appendChild(shakeDiv);
      }
    });

    // remove button handlers
    itemsEl.querySelectorAll('.cart-item-remove').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeFromCart(parseInt(btn.getAttribute('data-cart-idx')));
      });
    });

    var tax = Math.round(subtotal * 0.0825 * 100) / 100;
    var grand = Math.round((subtotal + tax) * 100) / 100;

    totalsEl.innerHTML =
      '<div class="cart-row"><span>Subtotal</span><span class="cart-row-value">' + money(subtotal) + '</span></div>' +
      '<div class="cart-row"><span>Tax</span><span class="cart-row-value">' + money(tax) + '</span></div>' +
      '<div class="cart-divider"></div>' +
      '<div class="cart-total-row"><span class="cart-total-label">Total</span><span class="cart-total-value">' + money(grand) + '</span></div>';

    $('#checkout-total').textContent = money(grand);
  }

  // ==========================================
  //  Three.js — Shared helpers
  // ==========================================

  function setupLighting(THREE, scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9a7b50, 0.7));
    var key = new THREE.DirectionalLight(0xfff1dc, 1.2);
    key.position.set(4, 7, 5);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xffe6cc, 0.6);
    fill.position.set(-5, 2, 4);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(0, 4, -6);
    scene.add(rim);
  }

  function setupEnvironment(THREE, scene, renderer) {
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.add(new THREE.AmbientLight(0xfff5e6, 1.0));
    var envKey = new THREE.DirectionalLight(0xfff1dc, 0.8);
    envKey.position.set(5, 10, 7);
    envScene.add(envKey);
    var envFill = new THREE.DirectionalLight(0xdceeff, 0.4);
    envFill.position.set(-5, 3, -5);
    envScene.add(envFill);
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();
  }

  function fixMaterials(THREE, model) {
    model.traverse(function (node) {
      if (node.isMesh && node.material) {
        var mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach(function (mat) {
          if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
            mat.needsUpdate = true;
          }
        });
        if (node.geometry && node.geometry.attributes.color) {
          mats.forEach(function (mat) {
            mat.vertexColors = true;
            mat.needsUpdate = true;
          });
        }
      }
    });
  }

  function autoFrame(THREE, model, pivot, targetSize) {
    var box = new THREE.Box3().setFromObject(model);
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    var maxDim = Math.max(size.x, size.y, size.z) || 1;
    var sc = targetSize / maxDim;
    model.scale.setScalar(sc);
    model.position.set(-center.x * sc, -center.y * sc, -center.z * sc);
    pivot.add(model);
  }

  // ==========================================
  //  Three.js — Main 3D Viewer
  // ==========================================

  var viewer = {
    inited: false,
    scene: null,
    pivot: null,
    currentModel: null,
    loadingUrl: null,
    raf: null,
    rot: { x: 0.12, y: 0.5 }
  };

  function initViewer() {
    var THREE = window.THREE;
    var cv = document.getElementById('viewer-canvas');
    if (!THREE || !THREE.GLTFLoader || !cv) {
      setTimeout(initViewer, 60);
      return;
    }
    if (viewer.inited) return;
    viewer.inited = true;

    var w = cv.clientWidth || 330;
    var h = cv.clientHeight || 300;

    var scene = new THREE.Scene();
    viewer.scene = scene;
    var camera = new THREE.PerspectiveCamera(34, w / h, 0.01, 100);
    camera.position.set(0, 0.45, 4.2);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w, h, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    setupLighting(THREE, scene);
    setupEnvironment(THREE, scene, renderer);

    var pivot = new THREE.Group();
    scene.add(pivot);
    viewer.pivot = pivot;

    loadModel(dishes[state.dishId].model);

    var dragging = false, px = 0, py = 0, idle = 0;

    cv.addEventListener('pointerdown', function (e) {
      dragging = true; idle = 0;
      px = e.clientX; py = e.clientY;
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      viewer.rot.y += (e.clientX - px) * 0.01;
      viewer.rot.x += (e.clientY - py) * 0.01;
      viewer.rot.x = Math.max(-0.6, Math.min(0.9, viewer.rot.x));
      px = e.clientX; py = e.clientY; idle = 0;
    });
    window.addEventListener('pointerup', function () { dragging = false; });

    var t0 = performance.now();
    var loop = function () {
      viewer.raf = requestAnimationFrame(loop);
      idle++;
      if (!dragging && idle > 36) viewer.rot.y += 0.0045;
      pivot.rotation.y = viewer.rot.y;
      pivot.rotation.x = viewer.rot.x;
      var t = (performance.now() - t0) / 1000;
      pivot.position.y = Math.sin(t * 1.3) * 0.05;
      renderer.render(scene, camera);
    };
    loop();
  }

  function loadModel(url) {
    var THREE = window.THREE;
    if (!THREE || !viewer.pivot) return;

    if (viewer.currentModel) {
      viewer.pivot.remove(viewer.currentModel);
      viewer.currentModel.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
            if (m && m.dispose) m.dispose();
          });
        }
      });
      viewer.currentModel = null;
    }

    viewer.rot.x = 0.12;
    viewer.rot.y = 0.5;
    viewer.loadingUrl = url;

    new THREE.GLTFLoader().load(url, function (gltf) {
      if (viewer.loadingUrl !== url) return;
      var model = gltf.scene;
      fixMaterials(THREE, model);
      autoFrame(THREE, model, viewer.pivot, 2.3);
      viewer.currentModel = model;
    }, undefined, function (e) { console.warn('[viewer] load failed:', url, e); });
  }

  // ==========================================
  //  Three.js — Home Featured Preview
  // ==========================================

  var homeViewer = {
    inited: false,
    raf: null,
    renderer: null,
    pivot: null
  };

  function initHomeViewer() {
    var THREE = window.THREE;
    var cv = document.getElementById('home-canvas');
    if (!THREE || !THREE.GLTFLoader || !cv) {
      setTimeout(initHomeViewer, 60);
      return;
    }
    if (homeViewer.inited) return;
    homeViewer.inited = true;

    var w = cv.clientWidth || 330;
    var h = cv.clientHeight || 230;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, w / h, 0.01, 100);
    camera.position.set(0, 0.4, 4.2);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    homeViewer.renderer = renderer;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w, h, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    setupLighting(THREE, scene);
    setupEnvironment(THREE, scene, renderer);

    var pivot = new THREE.Group();
    scene.add(pivot);
    homeViewer.pivot = pivot;

    new THREE.GLTFLoader().load('models/burger.glb', function (gltf) {
      var model = gltf.scene;
      fixMaterials(THREE, model);
      autoFrame(THREE, model, pivot, 2.3);
    }, undefined, function (e) { console.warn('[home] load failed', e); });

    var rotY = 0.4;
    var loop = function () {
      homeViewer.raf = requestAnimationFrame(loop);
      rotY += 0.006;
      pivot.rotation.y = rotY;
      pivot.rotation.x = 0.14;
      renderer.render(scene, camera);
    };
    loop();
  }

  function destroyHomeViewer() {
    if (homeViewer.raf) cancelAnimationFrame(homeViewer.raf);
    homeViewer.raf = null;
    if (homeViewer.renderer) {
      try { homeViewer.renderer.dispose(); } catch (e) {}
      homeViewer.renderer = null;
    }
    homeViewer.pivot = null;
    homeViewer.inited = false;
  }

  function ensureHomeViewer() {
    if (homeViewer.renderer) {
      var gl = homeViewer.renderer.getContext();
      if (gl && !gl.isContextLost()) return;
    }
    destroyHomeViewer();
    initHomeViewer();
  }

  // ==========================================
  //  Event Binding
  // ==========================================

  function bindEvents() {
    $('#featured-card').addEventListener('click', function () { selectDish('smash'); });
    $('#home-pill-burgers').addEventListener('click', function () { setState({ screen: 'menu', category: 'burgers', ar: false }); });
    $('#home-pill-sides').addEventListener('click', function () { setState({ screen: 'menu', category: 'sides', ar: false }); });
    $('#btn-fullmenu').addEventListener('click', function () { setState({ screen: 'menu', category: 'burgers', ar: false }); });

    $('#btn-back-detail').addEventListener('click', function () {
      var dish = dishes[state.dishId];
      setState({ screen: 'menu', category: dish.category, ar: false });
    });
    $('#btn-ar').addEventListener('click', function () {
      if (!tryNativeAR()) { setState({ ar: true }); }
    });
    $('#btn-dec').addEventListener('click', function () { setState({ qty: Math.max(1, state.qty - 1) }); });
    $('#btn-inc').addEventListener('click', function () { setState({ qty: Math.min(9, state.qty + 1) }); });
    $('#btn-fries').addEventListener('click', function () { setState({ fries: !state.fries }); });
    $('#btn-shake').addEventListener('click', function () { setState({ shake: !state.shake }); });
    $('#btn-add-order').addEventListener('click', function () { addToCart(); });

    $('#btn-back-menu').addEventListener('click', function () { setState({ screen: 'home', ar: false }); });
    $('#menu-pill-burgers').addEventListener('click', function () { setState({ category: 'burgers' }); });
    $('#menu-pill-sides').addEventListener('click', function () { setState({ category: 'sides' }); });

    $('#btn-back-cart').addEventListener('click', function () { setState({ screen: 'menu', category: 'burgers', ar: false }); });
    $('#btn-add-more').addEventListener('click', function () { setState({ screen: 'menu', category: 'burgers', ar: false }); });

    $('#btn-ar-close').addEventListener('click', function () { setState({ ar: false }); });
    $('#btn-ar-back').addEventListener('click', function () { setState({ ar: false }); });
    $('#btn-ar-add').addEventListener('click', function () { addToCart(); });
  }

  // ==========================================
  //  Init
  // ==========================================

  document.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    render();
    initViewer();
    initHomeViewer();
    updateARModelViewer();
  });
})();
