let config={
    
    type: Phaser.AUTO,
    
    scale:{
        mode: Phaser.Scale.FIT,
        width :800,
        height:600,
    },
    
    backgroundColor : 0xffff11,
    
    physics:{
        default:'arcade',
        arcade:{
            gravity:{
                y:1000,
            },
            //debug: true,
        }
    },
    
    scene:{
        preload : preload,
        create : create,
        update : update,
    }
};

let game= new Phaser.Game(config);

let game_cofig ={
    player_speed : 150,
    player_jumpspeed : -700,
};

function preload(){
    this.load.image("ground","topground.png");
    this.load.image("back","background.png");
    this.load.spritesheet("dude","dude.png",{frameWidth:32,frameHeight:48});
    this.load.image("apple","apple.png");
    this.load.image("ray","ray.png");
    
}

function create(){
    W= game.config.width;
    H= game.config.height;
    
    let ground = this.add.tileSprite(0,H-128,W,128,"ground");
    ground.setOrigin(0,0);
    
    //background
    let back = this.add.sprite(0,0,"back");
    back.setOrigin(0,0);
    back.displayWidth=W;
    back.displayHeight=H;
    back.depth =-2;
    
    //ray
    let rays=[];
    
        for(let i=-10;i<=10;i++){
        let ray = this.add.sprite(W/2,H-128,'ray');
        ray.displayHeight = 1.2*H;
        ray.setOrigin(0.5,1);
        ray.alpha=0.2;
        ray.angle=i*20;
        ray.depth=-1;
        rays.push(ray);
    }
    
    //tween
    this.tweens.add({
       targets:rays,
        props:{
            angle:{
                value:"+=20",
            }
        },
        duration : 6000,
        repeat:-1,
    });
    
    this.player= this.physics.add.sprite(100,100,'dude',4);
    console.log(this.player);
    
    //set bounce
    this.player.setBounce(0.5);
    this.player.setCollideWorldBounds(true);
    
    //animation of player
    this.anims.create({
        key : 'left',
        frames: this.anims.generateFrameNumbers('dude',{start:0,end:3}),
        frameRate : 10,
        repeat : -1,
    });
    
    this.anims.create({
        key : 'right',
        frames: this.anims.generateFrameNumbers('dude',{start:5,end:8}),
        frameRate : 10,
        repeat : -1,
    });
    
    this.anims.create({
        key : 'center',
        frames: this.anims.generateFrameNumbers('dude',{start:4,end:4}),
        frameRate : 10,
    });
    
    
    //player movements - keyboard
    this.cursors= this.input.keyboard.createCursorKeys();
    
    let fruits = this.physics.add.group({
        key:"apple",
        repeat:8,
        setScale : {x:0.2 , y:0.2},
        setXY : {x:10 , y:0, stepX:100}
    });
    
    //add bouncing to fruits
    fruits.children.iterate(function(f){
        f.setBounce(Phaser.Math.FloatBetween(0.4,0.7));
    });
    
    
    //create more platforms
    let platforms = this.physics.add.staticGroup();
    platforms.create(500,350,'ground').setScale(2,0.5).refreshBody();
    platforms.create(700,200,'ground').setScale(2,0.5).refreshBody(); 
    platforms.create(100,200,'ground').setScale(2,0.5).refreshBody();
    
    platforms.add(ground);
    
    this.physics.add.existing(ground,true);
    //ground.body.allowGravity = false;
    //ground.body.immovable = true;
    
    //collision detection b/w ground and player
    this.physics.add.collider(platforms,this.player);
    //this.physics.add.collider(ground,fruits);
    this.physics.add.collider(platforms,fruits);
    
    this.physics.add.collider(this.player,fruits,eatFruit,null,this);
    
    //create cameras
    this.cameras.main.setBounds(0,0,W,H);
    this.physics.world.setBounds(0,0,W,H);
    
    this.cameras.main.startFollow(this.player,true,true);
    this.cameras.main.setZoom(1.5);
}

function update(){
    
    if(this.cursors.left.isDown){
        this.player.setVelocityX(-game_cofig.player_speed);
        this.player.anims.play('left',true);
    }
    else if(this.cursors.right.isDown){
        this.player.setVelocityX(game_cofig.player_speed);
        this.player.anims.play('right',true);
    }
    else{
        this.player.setVelocityX(0);
        this.player.anims.play('center',true);
    }
    
    //add jumping ability ,stop the player when in air
    if(this.cursors.up.isDown && this.player.body.touching.down){
        this.player.setVelocityY(game_cofig.player_jumpspeed);
    }
}

function eatFruit(player,fruit){
    fruit.disableBody(true,true);
}