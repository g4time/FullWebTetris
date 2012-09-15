﻿var fwt = function () {
    // Canvas
    var canvas = $('#game-board #canvas')[0];
    var out = canvas.getContext('2d');

    // Board
    var map;
    var width = 16, height = 24, lastLine;

    // Game
    var gameStatus = 0; // 0: no init - 1: over - 2: paused - 3: game
    var level, score, dropBonus;
	var rnd0, rnd1, rnd2, rnd3, rnd4;

    // Velocity
    var delay = 0, normalDelay = 40, limitDelay = normalDelay;

    // Pieces
    var forms = [[[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]], [[1, 1], [1, 1]], [[1]], [[1, 1, 1, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]], [[1, 0], [1, 1]], [[0, 1], [1, 1]]];
    var next, current, shade;
    var clock = 0;

    // Options
    var shadeEnabled = false;

    // Graphics
    var opa_tile = new Image();
    opa_tile.src = "g/bl-block-a.png";
    var tra_tile = new Image();
    tra_tile.src = "g/bl-block-b.png";

    // rAF
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    window.cancelAnimFrame = (function () {
        return window.cancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                window.oCancelAnimationFrame ||
                window.msCancelAnimationFrame ||
                window.clearTimeout;
    })();

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    var newGame = function () {
        //window.webkitCancelAnimationFrame(clock);
        window.cancelAnimFrame(clock);

        lastLine = height - 1;
        gameStatus = 3;

        normalDelay = 40;
        limitDelay = normalDelay;

        level = 0;
        score = 0;
        $('#next #score').html(score);
        $('#next #level').html('<span class="xtr" data-xtr="level-lab">' + $.i18n._('level-lab') + '</span> ' + level);

        resetMap();
        setNextPiece(true);

        current = next;
        dropBonus = 0;

        setNextPiece();
        generateShade();

        clock = window.requestAnimFrame(pulse);
    }

    var pulse = function () {
        /* if (document.getElementById('audio').volume > 0) {
             document.getElementById('audio').volume -= 0.05;
             console.log('vol: ' + document.getElementById('audio').volume);
         }*/

        if (gameStatus != 3)
            return;

        delay++;

        if (delay > limitDelay) {
            delay = 0;

            if (canFall(current)) {
                current.j++;

                if (limitDelay == 1)
                    dropBonus++;
            } else {
                mark(1 + dropBonus, 'pulse');
                if (!freeze())  // false -> game over
                    return;

                dropBonus = 0;
                current = next;

                setNextPiece();
                generateShade();
            }
        }

        repaint();
        clock = window.requestAnimFrame(pulse);
    }

    var drop = function () {
        if (gameStatus < 2)
            return;

        if (gameStatus == 2)
            pause();

        j1 = current.j;

        while (canFall(current))
            current.j++;

        mark((current.j - j1) + Math.floor((current.j - j1) / 2) + 1 + dropBonus, 'drop');
        freeze();

        dropBonus = 0;
        current = next;

        setNextPiece();
        generateShade();

        delay = 0;
    }

    var freeze = function () {
        for (var j = current.form.length - 1; j >= 0; j--) {
            for (var i = 0; i < current.form[j].length; i++) {
                if (current.form[j][i] == 1) {
                    if (current.j + j >= 0) {
                        map[current.j + j][current.i + i].material = 1;
                    } else {
                        gameOver();
                        return false;
                    }
                }
            }
        }

        lastLine = Math.min(current.j, lastLine);

        checkLine();

        return true;
    }

    var gameOver = function () {
        gameStatus = 1;
        repaint();
        clearNext();
    }

    var mark = function (plus, type, about) {
        // score //
        score += plus;
        $('#next #score').html(score);

        // level //
        level = Math.floor(score / 3000);
        normalDelay = 40 - level;
        limitDelay = normalDelay;
        $('#next #level').html('<span class="xtr" data-xtr="level-lab">' + $.i18n._('level-lab') + '</span> ' + level);

        // osd //
        waitExtra = 0;
        classExtra = '';

        osdY = current.j * size - 25;
        if (osdY < 100)
            osdY = 100;
        osdX = (current.i * size) + (current.form[0].length * 25 / 2) - 250;

        msg = '';

        if (plus == 1)
            msg = rnd0[Math.round(Math.random() * 4)];

        if (plus > 1 && type == 'pulse') {
            max = height + Math.floor(height / 2) + 1;

            if (plus <= max / 2)
                msg = rnd1[Math.round(Math.random() * 4)];
            else
                msg = rnd2[Math.round(Math.random() * 4)];
        }

        if (lastLine < 5 && Math.random() * 5 > 2)
            msg = "Date prisa";

        if (type == 'drop')
            msg = rnd3[Math.round(Math.random() * 4)];

        if (plus >= 40 && type == "line") {
            msg = rnd4[about - 1];
            waitExtra = 400;
            classExtra = 'line';
        }

        $('<div>').html('¡' + msg + '! <strong>+ ' + plus + '</strong>').addClass(classExtra).css({ 'top': osdY, 'left': osdX, 'opacity': 0 }).appendTo('#osd').delay(waitExtra).animate({ 'top': osdY - 60, 'opacity': 1 }, 800, 'linear').animate({ 'top': osdY - 60 - 30, 'opacity': 0 }, 600, 'linear', function () {
            $(this).remove();
        });
    }

    var checkLine = function () {
        lines = 0;

        for (j = current.form.length - 1; j >= 0; j--) {

            n = 0;
            for (i = 0; i < width; i++) {
                if (map[current.j + j][i].material == 0)
                    break;
                else
                    n++;
            }

            if (n == width) {
                for (j_involved = current.j + j; j_involved > lastLine; j_involved--) {
                    for (i = 0; i < width; i++)
                        map[j_involved][i].material = map[j_involved - 1][i].material;  // IT CAN FAIL!
                }
                for (i = 0; i < width; i++)
                    map[lastLine][i].material = 0;
                lastLine++;
                j++;

                lines++;
            }

        }

        if (lines > 0) {
            fsum = [40, 100, 300, 1200];
            p = fsum[lines - 1] * (level + 1);
            mark(p, "line", lines);
        }
    }

    var canFall = function (piece) {
        if (piece.j + piece.form.length == height)
            return false

        for (i = 0; i < piece.form[0].length; i++) {
            for (j = piece.form.length - 1; j > -1; j--) {
                if (piece.form[j][i] != 0) {
                    if (map[piece.j + j + 1] !== undefined) {
                        if (map[piece.j + j + 1][piece.i + i].material != 0)
                            return false;
                        else
                            break;
                    }
                }
            }
        }

        return true;
    }

    var right = function () {
        if (gameStatus < 2)
            return;

        if (gameStatus == 2)
            pause();

        if (canRight()) {
            current.i++;

            generateShade();
        }
    }

    var left = function () {
        if (gameStatus < 2)
            return;

        if (gameStatus == 2)
            pause();

        if (canLeft()) {
            current.i--;

            generateShade();
        }
    }

    var generateShade = function () {
        if (shadeEnabled) {
            shade = clone(current);

            while (canFall(shade)) {
                shade.j++;
            }
        }
    }


    var rotateR = function () {
        if (gameStatus < 2)
            return;

        if (gameStatus == 2)
            pause();

        aux = new Array(current.form[0].length);

        for (j = 0; j < aux.length; j++)
            aux[j] = new Array(current.form.length);

        k = 0;
        for (j = current.form.length - 1; j > -1; j--) {
            for (i = 0; i < current.form[j].length; i++) {
                aux[i][k] = current.form[j][i];
            }
            k++;
        }

        if (canRotate(aux)) {
            current.form = aux;
            generateShade();
        }
    }

    var rotateL = function () {
        if (gameStatus < 2)
            return;

        if (gameStatus == 2)
            pause();

        aux = new Array(current.form[0].length);

        for (j = 0; j < aux.length; j++)
            aux[j] = new Array(current.form.length);

        k = current.form[0].length - 1;
        for (j = 0; j < aux.length; j++) {
            for (i = 0; i < aux[0].length; i++) {
                aux[j][i] = current.form[i][k];
            }
            k--;
        }

        if (canRotate(aux)) {
            current.form = aux;
            generateShade();
        }
    }

    var canRight = function () {
        if (current.i + current.form[0].length + 1 > width)
            return false;

        for (j = 0; j < current.form.length; j++) {
            for (i = current.form[0].length - 1; i > -1; i--) {
                if (current.form[j][i] != 0) {
                    if (map[current.j + j] !== undefined && map[current.j + j][current.i + i + 1].material != 0)
                        return false;

                    break;
                }
            }
        }

        return true;
    }

    var canLeft = function () {
        if (current.i - 1 < 0)
            return false;

        for (j = 0; j < current.form.length; j++) {
            for (i = 0; i < current.form[0].length; i++) {
                if (current.form[j][i] != 0) {
                    if (map[current.j + j] !== undefined && map[current.j + j][current.i + i - 1].material != 0)
                        return false;

                    break;
                }
            }
        }

        return true;
    }

    var canRotate = function (aux) {
        for (j = 0; j < aux.length; j++) {
            for (i = 0; i < aux[0].length; i++) {
                if (aux[j][i] != 0) {
                    if (current.j + j >= 0 && map[current.j + j][current.i + i].material != 0)
                        return false;
                }
            }
        }

        return true;
    }

    var resetMap = function () {
        map = new Array(height);

        for (j = 0; j < map.length; j++)
            map[j] = new Array(width);

        for (j = 0; j < map.length; j++) {
            for (i = 0; i < map[j].length; i++) {
                map[j][i] = {
                    material: 0,
                    //color : "",
                    //image : 0
                }
            }
        }
    }

    var pause = function (ii) {
        if (ii == 0) {
            if (gameStatus == 2) {
                gameStatus = 3;
                clock = window.requestAnimFrame(pulse);
            }
        } else if (ii == 1) {
            if (gameStatus == 3) {
                gameStatus = 2;
            }
        } else {
            if (gameStatus == 2) {
                gameStatus = 3;
                clock = window.requestAnimFrame(pulse);
            } else if (gameStatus == 3) {
                gameStatus = 2;
            }
        }
    }

    var repaint = function () {
        if (map !== undefined) {
            out.clearRect(0, 0, canvas.width, canvas.height);

            size = $("#game-board #canvas").innerHeight() / height;

            for (j = 0; j < map.length; j++)
                for (i = 0; i < map[0].length; i++)
                    if (map[j][i].material != 0)
                        if (gameStatus == 3)
                            out.drawImage(/*tiles[map[j][i].image - 1]*/opa_tile, size * i, size * j, size, size);
                        else
                            out.drawImage(/*tiles[map[j][i].image - 1]*/tra_tile, size * i, size * j, size, size);


            if (current !== undefined)
                for (j = 0; j < current.form.length; j++)
                    for (i = 0; i < current.form[j].length; i++)
                        if (current.form[j][i] == 1)
                            out.drawImage(opa_tile, (i * size) + (current.i * size), (j * size) + (current.j * size), size, size);

            if (shadeEnabled && shade !== undefined && current.j != shade.j) {
                for (j = 0; j < shade.form.length; j++)
                    for (i = 0; i < shade.form[j].length; i++)
                        if (shade.form[j][i] == 1)
                            out.drawImage(
								tra_tile,
								(i * size) + (shade.i * size),
								(j * size) + (shade.j * size),
								size,
								size
							);
            }
        }
    }

    var setNextPiece = function (first) {
        rndForm = Math.round(Math.random() * (forms.length - 1));
        iSource = Math.round(width / 2) - Math.round(forms[rndForm][0].length / 2);
        jSource = forms[rndForm].length * -1;

        next = { i: iSource, j: jSource, material: 1, form: forms[rndForm] }

        // --- //

        if (first !== true) {
            $('#next .oldNext').remove();
            $('#next .newNext').addClass('oldNext').removeClass('newNext').animate({ 'left': 120, 'opacity': 0 }, 260, function () {
                $(this).remove();
            });

            newCanvasNext = $('<canvas width="120" height="120">').addClass('newNext').appendTo('#next')[0];
            newOutNext = newCanvasNext.getContext('2d');

            centerX = (120 - next.form[0].length * 25) / 2;
            centerY = (120 - next.form.length * 25) / 2;

            for (j = 0; j < next.form.length; j++)
                for (i = 0; i < next.form[j].length; i++)
                    if (next.form[j][i] == 1)
                        newOutNext.drawImage(opa_tile, 25 * i + centerX, 25 * j + centerY, 25, 25);

            $(newCanvasNext).animate({ 'left': 0, 'opacity': 1 }, 260);
        }
    }

    var clearNext = function () {
        next = {};
        $('#next canvas').animate({ 'left': 120, 'opacity': 0 }, 260, function () {
            $(this).remove();
        });
    }

    var clone = function (obj) {
        if (null == obj || "object" != typeof obj) return obj;

        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        if (obj instanceof Array) {
            var copy = [];
            var len = obj.length
            for (var i = 0; i < len; ++i) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        if (obj instanceof Object) {
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    var adjust = function () {

        $(".board").css('width', $('#layout').innerWidth() - 12);
        $(".board").css('height', $('#layout').innerHeight() - 12 - 20);

        wPxB = $("#game-board").innerWidth() - 125;
        hPxB = $("#game-board").innerHeight();

        size = Math.floor(hPxB / height);
        wPxC = width * size;
        hPxC = height * size;

        if (wPxC > wPxB) {
            size = Math.floor(wPxB / width);
            wPxC = width * size
            hPxC = height * size;
        }

        $("#game-board #canvas").attr("width", wPxC);
        $("#game-board #canvas").attr("height", hPxC);
        $("#game-board #osd").css("width", wPxC);
        $("#game-board #osd").css("height", hPxC);

        fieldDistance = ($("#game-board").innerWidth() - 125 - wPxC) / 2;

        $("#game-board #canvas, #game-board #osd").css("top", ($("#game-board").innerHeight() - hPxC) / 2);
        $("#game-board #canvas, #game-board #osd").css("left", ($("#game-board").innerWidth() - 125 - wPxC) / 2 + 125);

        repaint();
    }

    var setEvents = function () {
        window.onresize = function () {
            adjust();
        }
        adjust();

        document.onkeyup = function (e) {
            if (e.keyCode == 40 || e.keyCode == 98)
                limitDelay = normalDelay;
            if (e.keyCode == 88)
                rotateR();
            if (e.keyCode == 90 || e.keyCode == 38 || e.keyCode == 104) //default
                rotateL();
            if (e.keyCode == 32 || e.keyCode == 96)
                drop();
            if (e.keyCode == 78 || e.keyCode == 105)
                newGame();
        }

        document.onkeydown = function (e) {
            if (e.keyCode == 39 || e.keyCode == 102)
                right();
            if (e.keyCode == 37 || e.keyCode == 100)
                left();
            if (e.keyCode == 80 || e.keyCode == 103)
                pause();
            if (e.keyCode == 40 || e.keyCode == 98) {
                if (gameStatus < 2)
                    return;
                if (gameStatus == 2)
                    pause();
                limitDelay = 1;
            }
        }

		setOSDMessages();
    }

	var setOSDMessages = function(){
        // OSD messages
        rnd0 = [$.i18n._('well'), $.i18n._('slow'), $.i18n._('candobetter'), $.i18n._('onemore'), $.i18n._('point')]
        rnd1 = ["Nada mal", "Muy bien", "Genial", "Sigue así", "No está mal"];
        rnd2 = ["Magnífico", "Muy rápido", "Rápido", "Fugaz", "Rapidisimo"];
        rnd3 = ["Instantaneo", "Lo más", "Bien hecho", "Estelar", "Impresionante"];
        rnd4 = ["Línea simple", "Linea doble", "Linea triple", "Eso es un tetris"];
	}

    // Public methods
    this.newGame = newGame;
    this.setEvents = setEvents;
    this.pause = pause;

    // Autorun
    //setEvents();
}
var $fwt = new fwt();