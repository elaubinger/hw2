var game = new Phaser.Game(448, 496, Phaser.AUTO);
    var Pacman = function (game) {
        this.map = null;
        this.layer = null;
        this.pacman = null;
        this.car = null;
        this.cartwo = null;
        this.carthree = null;
        this.carfour = null;
        this.safetile = 14;
        this.gridsize = 16;
        this.speed = 150;
        this.threshold = 3;
        this.hitcount = 2;
        this.marker = new Phaser.Point();
        this.turnPoint = new Phaser.Point();
        this.directions = [ null, null, null, null, null ];
        this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];
        this.current = Phaser.NONE;
        this.turning = Phaser.NONE;
    };
    Pacman.prototype = {
        init: function () {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
            this.physics.startSystem(Phaser.Physics.ARCADE);
        },
        preload: function () {
            //  We need this because the assets are on Amazon S3
            //  Remove the next 2 lines if running locally
            this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue005/';
            this.load.crossOrigin = 'anonymous';
            this.load.image('dot', 'assets/dot.png');
            this.load.image('tiles', 'assets/pacman-tiles.png');
            this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
            this.load.tilemap('map', 'assets/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.image('car', 'assets/car.png');
            //  Needless to say, graphics (C)opyright Namco
        },
        create: function () {
            this.map = this.add.tilemap('map');
            this.map.addTilesetImage('pacman-tiles', 'tiles');
            this.layer = this.map.createLayer('Pacman');
            this.dots = this.add.physicsGroup();
            this.map.createFromTiles(7, this.safetile, 'dot', this.layer, this.dots);
            //  The dots will need to be offset by 6px to put them back in the middle of the grid
            this.dots.setAll('x', 6, false, false, 1);
            this.dots.setAll('y', 6, false, false, 1);
            //  Pacman should collide with everything except the safe tile
            this.map.setCollisionByExclusion([this.safetile], true, this.layer);
            //this.pacman.setCollision([])
            //  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)
            this.pacman = this.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman', 0);
            this.pacman.anchor.set(0.5);
            this.pacman.animations.add('munch', [0, 1, 2, 1], 20, true);
            this.physics.arcade.enable(this.pacman);
            this.pacman.body.setSize(16, 16, 0, 0);
            
            //Add enemy to game
            this.car = this.add.sprite(16+8, 16+8, 'car', 0);
            this.car.anchor.set(0.5);
            this.physics.arcade.enable(this.car);
            this.car.body.setSize(16,16,0,0);
            
            //Add enemy to game
            this.cartwo = this.add.sprite((16*15)+8, (16*21)+8, 'car', 0);
            this.cartwo.anchor.set(0.5);
            this.physics.arcade.enable(this.cartwo);
            this.cartwo.body.setSize(16,16,0,0);
            
            //Add enemy to game
            this.carthree = this.add.sprite((16*10)+8, (16*1)+8, 'car', 0);
            this.carthree.anchor.set(0.5);
            this.physics.arcade.enable(this.carthree);
            this.carthree.body.setSize(16,16,0,0);
            
            //Add enemy to game
            this.carfour = this.add.sprite((16*11)+8, (16*22)+8, 'car', 0);
            this.carfour.anchor.set(0.5);
            this.physics.arcade.enable(this.carfour);
            this.carfour.body.setSize(16,16,0,0);
            
            this.cursors = this.input.keyboard.createCursorKeys();
            this.pacman.play('munch');
            this.move(Phaser.LEFT);
        },
        checkKeys: function () {
            if (this.cursors.left.isDown && this.current !== Phaser.LEFT)
            {
                this.checkDirection(Phaser.LEFT);
            }
            else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT)
            {
                this.checkDirection(Phaser.RIGHT);
            }
            else if (this.cursors.up.isDown && this.current !== Phaser.UP)
            {
                this.checkDirection(Phaser.UP);
            }
            else if (this.cursors.down.isDown && this.current !== Phaser.DOWN)
            {
                this.checkDirection(Phaser.DOWN);
            }
            else
            {
                //  This forces them to hold the key down to turn the corner
                this.turning = Phaser.NONE;
            }
        },
        checkDirection: function (turnTo) {
            if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile)
            {
                //  Invalid direction if they're already set to turn that way
                //  Or there is no tile there, or the tile isn't index 1 (a floor tile)
                return;
            }
            //  Check if they want to turn around and can
            if (this.current === this.opposites[turnTo])
            {
                this.move(turnTo);
            }
            else
            {
                this.turning = turnTo;
                this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
                this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
            }
        },
        turn: function () {
            var cx = Math.floor(this.pacman.x);
            var cy = Math.floor(this.pacman.y);
            //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
            if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold))
            {
                return false;
            }
            //  Grid align before turning
            this.pacman.x = this.turnPoint.x;
            this.pacman.y = this.turnPoint.y;
            this.pacman.body.reset(this.turnPoint.x, this.turnPoint.y);
            this.move(this.turning);
            this.turning = Phaser.NONE;
            return true;
        },
        move: function (direction) {
            var speed = this.speed;
            if (direction === Phaser.LEFT || direction === Phaser.UP)
            {
                speed = -speed;
            }
            if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
            {
                this.pacman.body.velocity.x = speed;
            }
            else
            {
                this.pacman.body.velocity.y = speed;
            }
            //  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
            this.pacman.scale.x = 1;
            this.pacman.angle = 0;
            if (direction === Phaser.LEFT)
            {
                this.pacman.scale.x = -1;
            }
            else if (direction === Phaser.UP)
            {
                this.pacman.angle = 270;
            }
            else if (direction === Phaser.DOWN)
            {
                this.pacman.angle = 90;
            }
            this.current = direction;
        },
        eatDot: function (pacman, dot) {
            dot.kill();
            if (this.dots.total === 0)
            {
                this.dots.callAll('revive');
            }
        },
        fight: function (pacman, enemy) {
            enemy.kill();
            this.hitcount -= 1;
        },
        update: function () {
          
            this.physics.arcade.collide(this.pacman, this.layer);
            this.physics.arcade.collide(this.car, this.layer);
            this.physics.arcade.collide(this.cartwo, this.layer);
            this.physics.arcade.collide(this.carthree, this.layer);
            this.physics.arcade.collide(this.carfour, this.layer);
            this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);
            this.physics.arcade.overlap(this.pacman, this.car, this.fight, null, this);
            this.physics.arcade.overlap(this.pacman, this.cartwo, this.fight, null, this);
            this.physics.arcade.overlap(this.pacman, this.carthree, this.fight, null, this);
            this.physics.arcade.overlap(this.pacman, this.carfour, this.fight, null, this);
            
            // chase pacman
            game.physics.arcade.moveToObject(this.car, this.pacman, 250);
            game.physics.arcade.moveToObject(this.cartwo, this.pacman, 120);
            game.physics.arcade.moveToObject(this.carthree, this.pacman, 50);
            game.physics.arcade.moveToObject(this.carfour, this.pacman, 100);
            
            // check if pacman is dead
            if(this.hitcount < 1){
                this.pacman.kill();
            }
            
            this.marker.x = this.math.snapToFloor(Math.floor(this.pacman.x), this.gridsize) / this.gridsize;
            this.marker.y = this.math.snapToFloor(Math.floor(this.pacman.y), this.gridsize) / this.gridsize;
            //  Update our grid sensors
            this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
            this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
            this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
            this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);
            this.checkKeys();
            if (this.turning !== Phaser.NONE)
            {
                this.turn();
            }
        }
    };
    game.state.add('Game', Pacman, true);
