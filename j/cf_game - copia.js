var Game;
Game = (function(){
  Game.displayName = 'Game';
  var o, π, ø, øs, canvas, context, map, topLine, clock, fps_clock, fps, state, GSOVER, GSPAUSED, GSACTIVE, delay, fallDelay, normalDelay, sets, colors, shapes, current, next, shade, defImg, odefault, hellShape, pulse, aborted, gameOver, endGame, right, left, canRight, canLeft, rotateCC, fastSpeed, normalSpeed, drop, freeze, checkLine, checkLineOld, makeShade, makeMap, canFall, repaint, makeNext, pauseGame, clone, udf, prototype = Game.prototype, constructor = Game;
  o = void 8;
  π = Math.PI;
  ø = undefined;
  øs = 'undefined';
  canvas = $('canvas#board').get(0);
  context = canvas.getContext('2d');
  map = ø;
  topLine = 0;
  clock = fps_clock = ø;
  fps = 0;
  state = ø;
  GSOVER = 0;
  GSPAUSED = 1;
  GSACTIVE = 2;
  delay = 0;
  fallDelay = normalDelay = 15;
  sets = {};
  sets.xdd = [[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]];
  sets.classic = [[[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]], [[1, 1], [1, 1]], [[1, 1, 1, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]]];
  sets.extended = sets.classic.concat([[[1, 0], [1, 1]], [[0, 1], [1, 1]], [[1]], [[0, 0], [1, 1]]]);
  sets.challenge = sets.extended.concat([[[0, 1, 0], [1, 1, 1], [0, 1, 0]], [[0, 1, 1], [0, 1, 1], [1, 1, 0]], [[1, 1, 0], [1, 1, 0], [0, 1, 1]], [[0, 1, 1], [0, 1, 1], [1, 1, 1]], [[1, 1, 0], [1, 1, 0], [1, 1, 1]], [[1, 1, 1], [1, 1, 0]], [[1, 1, 0], [1, 1, 1]], [[1, 0, 1], [1, 1, 1]], [[1, 1, 1]], [[0, 0, 1], [1, 1, 1], [1, 0, 0]], [[1, 0, 0], [1, 1, 1], [0, 0, 1]], [[1, 0, 0], [1, 1, 0], [1, 1, 1]], [[0, 0, 1], [0, 1, 1], [1, 1, 1]], [[0, 1, 0], [1, 1, 1], [1, 1, 0]], [[0, 1, 0], [1, 1, 1], [0, 1, 1]]]);
  sets.lethal = sets.challenge.concat([[[1, 1, 1], [1, 1, 0], [0, 1, 1]], [[1, 1, 1], [0, 1, 1], [1, 1, 0]], [[1, 1, 0], [0, 1, 1], [1, 1, 0]], [[1, 1, 0], [1, 1, 1], [0, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1]], [[0, 0, 1], [0, 1, 0], [1, 0, 0]], [[1, 0, 1], [0, 1, 0], [1, 0, 1]], [[0, 0, 1], [0, 1, 0], [1, 0, 1]], [[0, 1, 1], [1, 1, 0], [1, 0, 0]], [[0, 1], [1, 0]], [[0, 1], [1, 1], [1, 1], [0, 1], [0, 1]], [[1, 0], [1, 1], [1, 1], [1, 0], [1, 0]], [[0, 1], [1, 1], [1, 1], [0, 1], [1, 1]], [[1, 1], [1, 0], [1, 1], [1, 0], [1, 1]], [[1, 1], [1, 0], [0, 1], [1, 0], [0, 1]], [[1, 0], [1, 1], [1, 1], [1, 0], [1, 1]], [[1, 1], [0, 1], [1, 0], [0, 1], [1, 0]], [[1, 1, 1], [1, 0, 1], [1, 1, 1]], [[1, 1, 1], [0, 0, 1], [1, 1, 1]], [[1, 1, 0], [1, 0, 1], [1, 0, 1]], [[1, 1, 0], [1, 1, 1], [1, 0, 1]], [[0, 1, 1], [1, 0, 1], [1, 0, 1]], [[0, 1, 1], [1, 1, 1], [1, 0, 1]], [[0, 1, 0], [1, 1, 1], [1, 0, 1]], [[1, 1, 1], [0, 1, 0], [1, 1, 1]]]);
  colors = ["red", "green", "blue", "cyan", "purple", "orange", "yellow", "brown", "emerald", "pink", "white"];
  shapes = current = next = shade = ø;
  defImg = new Image();
  defImg.src = "g/material/iced-o.png";
  window.requestAnimFrame = function(){
    return window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || window.webkitRequestAnimationFrame || function(callback){
      return window.setTimeout(callback, 1000 / 60);
    };
  }();
  window.cancelAnimFrame = function(){
    return window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.oCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
  }();
  function Game(options){
    o = options;
    odefault();
    shapes = sets[o.set];
    map = makeMap();
    state = GSACTIVE;
    current = makeNext();
    if (o.shadeOn) {
      makeShade();
    }
    repaint();
    next = makeNext();
    clock = requestAnimFrame(pulse);
  }
  odefault = function(){
    if (udf(o.width)) {
      o.width = 16;
    }
    if (udf(o.height)) {
      o.height = 24;
    }
    if (udf(o.set)) {
      o.set = 'extended';
    }
    if (udf(o.rotate)) {
      o.rotate = 'cc';
    }
    if (udf(o.theme)) {
      o.theme = 'iced';
    }
    if (udf(o.ccolorsOn)) {
      o.ccolorsOn = true;
    }
    if (udf(o.shadeOn)) {
      o.shadeOn = false;
    }
    if (udf(o.zerogOn)) {
      o.zerogOn = false;
    }
  };
  hellShape = function(){
    throw Error('unimplemented');
  };
  pulse = function(){
    clock = requestAnimFrame(pulse);
    if (state === GSACTIVE) {
      if (delay > fallDelay) {
        delay = 0;
        if (canFall(current)) {
          current.j++;
        } else {
          if (freeze(current) === false) {
            gameOver();
            return;
          }
          current = next;
          next = makeNext();
          if (o.shadeOn) {
            makeShade();
          }
        }
        repaint();
      }
      fps++;
      return delay++;
    }
  };
  aborted = function(){
    cancelAnimFrame(clock);
    state = GSOVER;
    repaint();
    return true;
  };
  gameOver = function(){
    console.log("Game over");
    return aborted();
  };
  endGame = function(){
    console.log("Game interrupted");
    return aborted();
  };
  right = function(){
    if (state === GSOVER) {
      return false;
    }
    if (state === GSPAUSED) {
      pauseGame(false);
    }
    if (canRight()) {
      current.i++;
      if (o.shadeOn) {
        makeShade();
      }
      repaint();
      return true;
    }
    return false;
  };
  left = function(){
    if (state === GSOVER) {
      return false;
    }
    if (state === GSPAUSED) {
      pauseGame(false);
    }
    if (canLeft()) {
      current.i--;
      if (o.shadeOn) {
        makeShade();
      }
      repaint();
      return true;
    }
    return false;
  };
  canRight = function(){
    var i$, to$, j, j$, i, mi, mj;
    if (current.i + current.w + 1 > o.width) {
      return false;
    }
    for (i$ = 0, to$ = current.h; i$ < to$; ++i$) {
      j = i$;
      for (j$ = current.w - 1; j$ >= 0; --j$) {
        i = j$;
        if (current._(i, j) !== 0) {
          mi = current.i + i + 1;
          mj = current.j + j;
          if (current.j + j - 1 > -1 && (map[mj][mi] !== null && map[mj][mi].t === 1)) {
            return false;
          }
          break;
        }
      }
    }
    return true;
  };
  canLeft = function(){
    var i$, to$, j, j$, to1$, i, mi, mj;
    if (current.i - 1 < 0) {
      return false;
    }
    for (i$ = 0, to$ = current.h; i$ < to$; ++i$) {
      j = i$;
      for (j$ = 0, to1$ = current.w; j$ < to1$; ++j$) {
        i = j$;
        if (current._(i, j) !== 0) {
          mi = current.i + i - 1;
          mj = current.j + j;
          if (current.j + j - 1 > -1 && (map[mj][mi] !== null && map[mj][mi].t === 1)) {
            return false;
          }
          break;
        }
      }
    }
    return true;
  };
  rotateCC = function(){
    var aux, i$, to$, j, k, j$, to1$, i, _;
    if (state === GSOVER) {
      return false;
    }
    if (state === GSPAUSED) {
      pauseGame(false);
    }
    aux = new Array(current.w);
    for (i$ = 0, to$ = aux.length; i$ < to$; ++i$) {
      j = i$;
      aux[j] = new Array(current.h);
    }
    k = current.w - 1;
    for (i$ = 0, to$ = aux.length; i$ < to$; ++i$) {
      j = i$;
      for (j$ = 0, to1$ = aux[0].length; j$ < to1$; ++j$) {
        i = j$;
        aux[j][i] = current._(k, i);
      }
      k--;
    }
    current.s = aux;
    _ = current.w;
    current.w = current.h;
    current.h = _;
    if (o.shadeOn) {
      makeShade();
    }
    repaint();
    return true;
    return false;
  };
  fastSpeed = function(){
    if (state === GSOVER) {
      return false;
    }
    if (state === GSPAUSED) {
      pauseGame(false);
    }
    fallDelay = 1;
    return true;
  };
  normalSpeed = function(){
    fallDelay = normalDelay;
    return true;
  };
  drop = function(){
    if (state === GSOVER) {
      return false;
    }
    if (state === GSPAUSED) {
      pauseGame(false);
    }
    while (canFall(current)) {
      current.j++;
    }
    if (freeze(current) === false) {
      return gameOver();
    }
    current = next;
    next = makeNext();
    if (o.shadeOn) {
      makeShade();
    }
    repaint();
    delay = 0;
    return true;
  };
  freeze = function(piece){
    var i$, j, j$, to$, i, ref$;
    for (i$ = piece.h - 1; i$ >= 0; --i$) {
      j = i$;
      for (j$ = 0, to$ = piece.w; j$ < to$; ++j$) {
        i = j$;
        if (piece._(i, j) !== 0) {
          if (piece.j + j > -1) {
            map[piece.j + j][piece.i + i] = {
              t: piece.t,
              c: piece.c
            };
          } else {
            return false;
          }
        }
      }
    }
    topLine = (ref$ = current.j) < topLine ? ref$ : topLine;
    checkLine();
    return true;
  };
  checkLine = function(){
    var lines, i$, to$, row, nTiles, j$, to1$, col, itv, k$, to2$, mods, anim;
    lines = [];
    for (i$ = current.j + current.h - 1, to$ = current.j; i$ >= to$; --i$) {
      row = i$;
      nTiles = 0;
      for (j$ = 0, to1$ = o.width; j$ < to1$; ++j$) {
        col = j$;
        if (map[row][col] === null) {
          break;
        } else {
          nTiles++;
        }
      }
      if (nTiles === o.width) {
        lines.push(row);
      }
    }
    lines.push(topLine - 1);
    if (lines.length === 1) {
      return false;
    }
    for (i$ = 0, to$ = lines.length; i$ < to$; ++i$) {
      itv = i$;
      for (j$ = 0, to1$ = o.width; j$ < to1$; ++j$) {
        col = j$;
        map[lines[itv]][col] = null;
      }
      for (j$ = lines[itv] - 1, to1$ = lines[itv + 1]; j$ > to1$; --j$) {
        row = j$;
        console.log('Fila ' + row + ' deberá bajar ' + (itv + 1));
        for (k$ = 0, to2$ = o.width; k$ < to2$; ++k$) {
          col = k$;
          if (map[row][col] !== null) {
            map[row][col].t$ = itv + 1;
            map[row][col].o$ = 0;
          }
        }
      }
    }
    cancelAnimFrame(clock);
    mods = 1;
    anim = function(){
      var i$, to$, row, j$, to1$, col, t$;
      if (mods > 0) {
        requestAnimFrame(anim);
      } else {
        clock = requestAnimFrame(pulse);
        return;
      }
      mods = 0;
      for (i$ = lines[0] - 1, to$ = topLine; i$ >= to$; --i$) {
        row = i$;
        for (j$ = 0, to1$ = o.width; j$ < to1$; ++j$) {
          col = j$;
          if (map[row][col] !== null && map[row][col].t$ !== 0) {
            if (map[row][col].o$ < map[row][col].t$) {
              map[row][col].o$ = Math.floor((map[row][col].o$ + 0.25) * 100) / 100;
              mods++;
            }
            if (map[row][col].o$ === map[row][col].t$) {
              t$ = map[row][col].t$;
              map[row][col].t$ = 0;
              map[row][col].o$ = 0;
              map[row + t$][col] = clone(map[row][col]);
              map[row][col] = null;
            }
          }
        }
      }
      return repaint();
    };
    anim();
  };
  checkLineOld = function(){
    var nLines, i$, cRow, nTiles, j$, to$, mCol, jInvolved, k$, to1$, i, fsum;
    nLines = 0;
    for (i$ = current.h - 1; i$ >= 0; --i$) {
      cRow = i$;
      nTiles = 0;
      for (j$ = 0, to$ = o.width; j$ < to$; ++j$) {
        mCol = j$;
        if (map[current.j + cRow][mCol] === null) {
          break;
        } else {
          nTiles++;
        }
      }
      if (nTiles === o.width) {
        for (j$ = current.j + cRow, to$ = topLine; j$ > to$; --j$) {
          jInvolved = j$;
          for (k$ = 0, to1$ = o.width; k$ < to1$; ++k$) {
            i = k$;
            map[jInvolved][i] = clone(map[jInvolved - 1][i]);
          }
        }
        for (j$ = 0, to$ = o.width; j$ < to$; ++j$) {
          i = j$;
          map[topLine][i] = null;
        }
        topLine++;
        cRow++;
        nLines++;
      }
    }
    if (nLines > 0) {
      fsum = [10, 25, 75, 300];
      return true;
    }
    return false;
  };
  makeShade = function(){
    shade = clone(current);
    while (canFall(shade)) {
      shade.j++;
    }
  };
  makeMap = function(entropy){
    var row, map, res$, i$, to$;
    if (typeof entropy === 'undefined') {
      row = function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = o.width; i$ < to$; ++i$) {
          results$.push(null);
        }
        return results$;
      };
      res$ = [];
      for (i$ = 0, to$ = o.height; i$ < to$; ++i$) {
        res$.push(row());
      }
      map = res$;
      topLine = o.height - 1;
    }
    return map;
  };
  canFall = function(piece){
    var i$, to$, i, j$, j, mi, mj;
    if (piece.j + piece.h === o.height) {
      return false;
    }
    for (i$ = 0, to$ = piece.w; i$ < to$; ++i$) {
      i = i$;
      for (j$ = piece.h - 1; j$ >= 0; --j$) {
        j = j$;
        if (piece._(i, j) !== 0 && piece.j + j + 1 > -1) {
          mi = piece.i + i;
          mj = piece.j + j + 1;
          if (map[mj][mi] !== null && map[mj][mi].t === 1) {
            return false;
          }
        }
      }
    }
    return true;
  };
  repaint = function(){
    var size, i$, to$, j, j$, to1$, i, x, y, o$, lresult$, results$ = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
    size = canvas.height / o.height;
    for (i$ = 0, to$ = o.height; i$ < to$; ++i$) {
      j = i$;
      for (j$ = 0, to1$ = o.width; j$ < to1$; ++j$) {
        i = j$;
        if (map[j][i] !== null) {
          x = size * i;
          y = size * (o.zerogOn ? o.height - 1 - j : j);
          o$ = typeof map[j][i].o$ !== 'undefined' ? size * map[j][i].o$ : 0;
          context.drawImage(defImg, x, y + o$, size, size);
        }
      }
    }
    if (state !== GSOVER) {
      for (i$ = 0, to$ = current.h; i$ < to$; ++i$) {
        j = i$;
        lresult$ = [];
        for (j$ = 0, to1$ = current.w; j$ < to1$; ++j$) {
          i = j$;
          if (current._(i, j) === 1) {
            x = i * size + current.i * size;
            y = size * (o.zerogOn ? current.h - 1 - j : j) + size * (o.zerogOn
              ? o.height - 1 - current.j
              : current.j);
            lresult$.push(context.drawImage(defImg, x, y, size, size));
          }
        }
        results$.push(lresult$);
      }
      return results$;
    }
  };
  makeNext = function(first, paintOnly){
    var rndShape, shape, iSource, jSource, piece;
    rndShape = Math.round(Math.random() * (shapes.length - 1));
    shape = shapes[rndShape];
    iSource = Math.round(o.width / 2) - Math.round(shape.length / 2);
    jSource = shape.length * -1;
    piece = {
      i: iSource,
      j: jSource,
      w: shape[0].length,
      h: shape.length,
      t: 1,
      s: shape,
      _: function(a, b){
        return this.s[b][a];
      }
    };
    if (o.ccolorsOn && (o.set === 'classic' || o.set === 'extended')) {
      piece.c = colors[rndShape];
    } else {
      piece.c = colors[Math.round(Math.random() * (colors.length - 1))];
    }
    return piece;
  };
  pauseGame = function(force){
    var state;
    if (force === false) {
      if (state === GSPAUSED) {
        state = GSACTIVE;
        repaint();
      }
    } else if (force === true) {
      if (state === GSACTIVE) {
        state = GSPAUSED;
        repaint();
      }
    } else {
      if (state === GSPAUSED) {
        state = GSACTIVE;
        repaint();
      } else if (state === GSACTIVE) {
        state = GSPAUSED;
        repaint();
      }
    }
  };
  clone = function(obj){
    var copy, len, i$, i, attr;
    if (null === obj || "object" !== typeof obj) {
      return obj;
    }
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }
    if (obj instanceof Array) {
      copy = [];
      len = obj.length;
      for (i$ = 0; i$ < len; ++i$) {
        i = i$;
        copy[i] = clone(obj[i]);
      }
      return copy;
    }
    if (obj instanceof Object) {
      copy = {};
      for (attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = clone(obj[attr]);
        }
      }
      return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
  };
  udf = function(a){
    return typeof a === 'undefined';
  };
  prototype.pauseGame = pauseGame;
  prototype.endGame = endGame;
  prototype.left = left;
  prototype.right = right;
  prototype.rotate = rotateCC;
  prototype.fastSpeed = fastSpeed;
  prototype.normalSpeed = normalSpeed;
  prototype.drop = drop;
  return Game;
}());