//  --------------------------------------------------- Définition du contexte du canvas
var cs=document.getElementById("cv");
var ctx=cs.getContext("2d");
ctx.font="15px Arial";


//  --------------------------------------------------- Définition de l'eventListener pour la souris sur le canvas
cv.addEventListener("click",gunshot,false);




var interv=[]; // L'array interv contiendra tous les SetInterval créés au cours du processus et sera utilisé pour les arrêter une fois le jeu terminé
var gameOn=true; // Le booléen gameOn est à l'état true lorsque le jeu est en cours et à false dans le cas contraire
var specific=[]; // cet array contiendra un setInterval spécial que nous voudrons arrêter pendant que le jeu fonction.

//  --------------------------------------------------- Gestion des chargements d'images
var zombie1=new Image();
    zombie1.src="Weak.png";

var boss=new Image();
    boss.src="Boss.png";
  
var zombie3=new Image();
    zombie3.src="Strong.png";

var zombie2=new Image();
    zombie2.src="Medium.png";

var stone=new Image();
	stone.src="stone.png"

var bossStone=new Image();
	bossStone.src="BossStone.png"
 

// Images Zombie touché    
var zombie1Hit=new Image();
    zombie1Hit.src="Weak.png";
 
var bossHit=new Image();
    bossHit.src="BossHit.png";
 
var zombie3Hit=new Image();
    zombie3Hit.src="StrongHit.png";
    
var zombie2Hit=new Image();
    zombie2Hit.src="MediumHit.png";
    


var grass=new Image();
    grass.src="grass.png";
    grass.loaded=false;
var Ground=new Image();
    Ground.src="graveyardGround.png";
    Ground.loaded=false;
var congrats=new Image();
	congrats.src="congrats.png";
var lost=new Image();
	lost.src="lost.png";


//  --------------------------------------------------- Initialisation des Arrays de Zombies
// Les array xZombies contiendront 130 zombies chacun , selon leur type (faible,moyen ou fort), dans chaque case de l'array.
var weakZombies=[]; 
weakZombies.length=130;
var mediumZombies=[];
mediumZombies.length=130;
var strongZombies=[];
strongZombies.length=130;

// Les arrays xZombiesIN contiendront les zombies qui sont sur le canvas , donc considérés en jeu.
var weakZombiesIN=[];
var mediumZombiesIN=[];
var strongZombiesIN=[];
var bossZombiesIN=[];

// Ces arrays seront utilisés pour gérer le fait de tirer sur les zombies 
var enemiesIN=[];
var enemiesIN2=[];
var enemiesOnSet=[];
var enemiesKilled=[];
var enemyHits=[];



//  --------------------------------------------------- Fonction de traçage du Canvas
function createArea(){
	// On utilise deux modèles pour notre canvas ,dont un qui sera dessiné sur la partie haute du canvas représentant la partie où les zombies peuvent apparaître
	ctx.clearRect(0,0,600,800);
    var pat=ctx.createPattern(grass,"repeat");
        ctx.fillStyle=pat;
        ctx.fillRect(0,100,600,700);

    var pat=ctx.createPattern(Ground,"repeat");
        ctx.fillStyle=pat;
        ctx.fillRect(0,0,600,100);
}


//  --------------------------------------------------- Constructeur objet zombie
var zombie={


	isCreated: function(type,img,sizeX,sizeY,posX,posY,Hp,reward,hitImg,posture,pPosture){
		this.type=type;
		this.img=img;
		this.sizeX=sizeX;
		this.sizeY=sizeY;				
		this.Hp=Hp;						// Hp est le nombre de points de vie restant au zombie
		this.reward=reward;				// reward représente le nombre de points que le zombie donne une fois qu'il est touché
		this.hitImg=hitImg;				
		this.posX=posX;
		this.posY=posY;
		this.posture=posture;
		this.pPosture=pPosture;			// pPosture et Posture représente respectivement la posture précédete et la posture actuelle du zombie.
		this.ID="";						// On donne aux zombies une ID qui correspondra à la première lettre de leur type concaténée avec leur position 
		this.status=false;				// dans leur array respectif et cela nous servira au moment d'interagir avec nos zombies en jeu.
		
		
	},
	getHp: function(){
		return this.Hp;
	},

	setHp: function(newHp){
		this.Hp=newHp;
	},

	getPosX: function(){
		return this.posX;
	},

	getPosY: function(){
		return this.posY;
	},

	setPosY: function(newPosY){
		this.posY=newPosY;
	},

	setPosture: function(newPosture){
		this.posture=newPosture;
	},

	getPosture: function(){
		return this.posture;
	},

	setpPosture: function(previousPosture){
		this.pPosture=previousPosture;
	},

	getpPosture: function(){
		return this.pPosture;
	},

	getID: function(){
		return this.ID;
	},

	setID: function(string){
		this.ID=this.type.substring(0,1)+string;;
	},
	setStatus: function(bool){
		this.status=bool;
	},

	getStatus: function(){
		return this.status;
	},

	setImg: function(newImg){
		this.img=newImg;
	},

	getImg: function(){
		return this.img;
	}
	
}

//  --------------------------------------------------- Initialisation des différents types de zombies
/*On initialise un zombie grâce au constructeur d'objet zombie */
var weakEnemy=Object.create(zombie);
weakEnemy.createWeakZombie= function(type,posX){
	this.isCreated("Weak",zombie1,55,75,posX,5,1,1,zombie1Hit,18,0);
	
}
var mediumEnemy=Object.create(zombie);
mediumEnemy.createMediumZombie= function(type,posX){
	this.isCreated("Medium",zombie2,55,75,posX,5,2,3,zombie2Hit,18,0);
	
}
var strongEnemy=Object.create(zombie);
strongEnemy.createStrongZombie= function(type,posX){
	this.isCreated("Strong",zombie3,68,93,posX,5,3,5,zombie3Hit,18,0);
	
}
var Boss=Object.create(zombie);
Boss.createBoss= function(type,posX){
	this.isCreated("Boss",boss,55,90,posX,5,25,30,bossHit,18,0);
	
}

//  --------------------------------------------------- Fonctions de dessin
/*Chaque type de Zombie est dessiné avec sa fonction propre car on souhaite donner à nos zombies des
 tailles différentes par exemple , 
de plus les spécificités des spritesheets nosu obligent à traiter chaque cas différemment.
La fonction de dessin, comprend en plus du sprite du zombie à dessiner la gestion de sa barre de vie
 , on fonctionne en terme de fraction
du nombre de points de vie total et on fait ainsi varier la taille et la couleur de la barre de vie
 du zombie en fonction des points de vie qui lui restent.*/
zombie.drawWeakZombie = function(motion,positionY){
	this.setPosY(positionY);
	motion=this.posture;
	if(this.posY<=120){
					this.drawStone();

	}
	ctx.drawImage(this.img,motion,212,this.sizeX,this.sizeY,this.posX,this.posY,this.sizeX,this.sizeY);
	var health=this.getHp();
	var healthLevel=health*55;
	ctx.fillStyle="#00ff1e";
	ctx.fillRect(this.posX,this.posY-10,healthLevel,2);
	

}
zombie.drawMediumZombie = function(motion,positionY){
	this.setPosY(positionY);
	motion=this.posture;
	if(this.posY<=75){
					this.drawStone();

	}
	ctx.drawImage(this.img,motion,212,this.sizeX,this.sizeY,this.posX,this.posY,this.sizeX,this.sizeY);
	var healthLevel=(this.getHp()/2)*55;
	if (this.getHp()===1){ctx.fillStyle="red";}
	else if (this.getHp()===2){ctx.fillStyle="#00ff1e";}
	ctx.fillRect(this.posX,this.posY-10,healthLevel,2);
	
}
zombie.drawStrongZombie = function(motion,positionY){
	this.setPosY(positionY);
	motion=this.posture;
	if(this.posY<=100){
					this.drawStone();

	}
	ctx.drawImage(this.img,motion,212,66,90,this.posX,this.posY,this.sizeX,this.sizeY);
	
	var healthLevel=(this.getHp()/3)*66;
	if (this.getHp()===3){ctx.fillStyle="#00ff1e";}
	else if(this.getHp()===2){ctx.fillStyle="orange";}
	else if (this.getHp()===1){ctx.fillStyle="red";}
	
	ctx.fillRect(this.posX,this.posY-10,healthLevel,2);
	
	
}
zombie.drawBoss = function(motion,positionY){
	this.setPosY(positionY);
	motion=this.posture;
	if(this.posY<=120){
					this.drawStone();

	}
	ctx.drawImage(this.img,motion,208,55,90,this.posX,this.posY,82,132);
	
	var healthLevel=(this.getHp()/25)*82;
	if (this.getHp()>20){ctx.fillStyle="#00ff1e";}
	else if(this.getHp()<=20 && this.getHp()>5){ctx.fillStyle="orange";}
	else if (this.getHp()<=5){ctx.fillStyle="red";}
	ctx.fillRect(this.posX,this.posY-10,healthLevel,2);
	
	
}
/*La fonction de dessin de la pierre est un simple drawImage auquel on ajoute une boucle if pour 
dessiner une tombe spéciale pour notre Boss des Zombies*/
zombie.drawStone= function(){
	if(this.type!=="Boss"){
		ctx.drawImage(stone,this.posX,10);
	}
	else{
		ctx.drawImage(bossStone,this.posX,10);
	}
	
	
	

}

//  --------------------------------------------------- Gestion des mouvements
zombie.motion = function(i) {
	
	
	var position=this.getPosY();
	var pPosition=0;
	var posture=this.getPosture();
	/*Le bout de code suivant prend en charge le mouvement du zombie en fonction de sa vitesse (vitesse en fonction de l'entier i , qui part de 1 à 4 en fonction
	 du type dee zombie) ainsi que le changement d'état entre les pas de notre zombie*/
	if (i===1){
		pPosition=position;
		position+=12;
	}
	else if (i===2){
		pPosition=position;
		position+=6;
	}
	else if(i===3){
		pPosition=position;
		position+=8;
	}

	else if (i===4){
		pPosition=position;
		position+=3;
	}

	this.setPosY(position);

	
	if(posture===18){
		this.setPosture(91);
		this.setpPosture(18);
	}
    else if(posture===91 && this.pPosture===18){
    	this.setPosture(165);
    	this.setpPosture(91);

    }
    else if(posture===165){
    	this.setPosture(91);
    	this.setpPosture(165);
    }
    else if(posture===91 && this.pPosture===165){
    	this.setPosture(18);
    	this.setpPosture(91);
    }

    /*Une fois qu'on a géré le mouvement des zombies , on utilise les fonctions de dessin et on change donc en conséquence la posture du zombie ainsi que sa position en mettant à jour
    au fur et à mesure.
    */

    if (i===1){
    	
		this.drawWeakZombie(this.getPosture(),this.getPosY());

	}
	else if (i===2){
		
		this.drawMediumZombie(this.getPosture(),this.getPosY());
	}
	else if(i===3){
		
		this.drawStrongZombie(this.getPosture(),this.getPosY());
	}

	else if (i===4){
		
		this.drawBoss(this.getPosture(),this.getPosY());
	}


}

/*La prochaine section contient l'initialisation des arrays de zombies , on a trois array de 130 cellules dans chaque cellule on crée un zombie et on lui attribue une abcisse de création aléatoire 
lorsqu'il sera lancé en jeu. */

//  --------------------------------------------------- Création Array Zombie faible


initWeak =function(randX){
	var newzombie1=Object.create(weakEnemy);
	newzombie1.createWeakZombie("Weak",randX);
	return newzombie1;

}

fillWeak=function(){
	for (i=0;i<130;i++){
		weakZombies[i]=initWeak(Math.floor(Math.random()*550));
		weakZombies[i].setID(i.toString());
		weakZombies[i].setStatus(true);
	}
}



//  --------------------------------------------------- Création Array Zombie moyen
initMedium =function(randX){
	var newzombie2=Object.create(mediumEnemy);
	newzombie2.createMediumZombie("Medium",randX);
	return newzombie2;
}

fillMedium=function(){
	for (i=0;i<130;i++){
		mediumZombies[i]=initMedium(Math.floor(Math.random()*550));
		mediumZombies[i].setID(i.toString());
		mediumZombies[i].setStatus(true);
	}
}

//  ---------------------------------- Création Array Zombie fort

initStrong =function(randX){
	var newzombie3=Object.create(strongEnemy);
	newzombie3.createStrongZombie("Strong",randX);
	return newzombie3;

}

fillStrong=function(){
	for (i=0;i<130;i++){
		strongZombies[i]=initStrong(Math.floor(Math.random()*550));
		strongZombies[i].setID(i.toString());
		strongZombies[i].setStatus(true);
	}
	

}

initBoss =function(randX){
	var newBoss=Object.create(Boss);
	newBoss.createBoss("Boss",randX);
	newBoss.setID("");
	newBoss.setStatus(true);
	return newBoss;
}
                              

//  ---------------------------------- Gestion de l'animation
/*Cette fonction sera le moteur du jeu elle contient tous les processus (setInterval) qui vont se 
lancer et on ne la lance qu'une fois par partie dans la boucle de jeu*/
manager=function(){

	/*EnemiesOnSet est l'array contenant tous les zombies qui sont sur le canvas , enemiesIN est 
	l'array des ennemis créés toutes les secondes pairs à partir du début du jeu et enemiesIN2 est l'array des 
	zombies créés toutes les secondes impaires à partir de la 139ème. Nous gèrons ainsi le fait que 
	les zombies apparaissent deux fois plus souvent lors des 60 deernières secondes.*/
	var onSet= setInterval(function(){
		enemiesOnSet=enemiesIN.concat(enemiesIN2);

	},2000)
	interv.push(onSet);
	
	/* Lors des 30 premières secondes il n'y a que les zombies faibles donc i (qui est l'entier selon
	 lequel on crée un zombie faible pour 0 , moyen pour 1 , fort pour 2 )va rester à 0*/
	var i=0;

	/*Au bout de 30 secondes on peut avoir des zombies moyens aussi donc i devient un entier aléatoire entre 0 et 1*/
	setTimeout(function(){
		var interWeak = setInterval(function(){
			i=Math.floor(Math.random()*2);
		},1000);
		specific.push(interWeak);
	},30000)	


	/*Au bout de 100 secondes on peut aussi avoir des zombies forts sur le terrain donc i varie 
	aléatoirement entre 0,1 et 2*/
	setTimeout(function(){
		clearInterval(specific[i]);
		setInterval(function(){
			i=Math.floor(Math.random()*3);
		},1000);
		
	},100000)
	

	/*Donc cette section de code remplit enemiesIN , toutes les 2 secondes , on récupère le premier 
	zombie d'un array aléatoirement choisi entre l'array des zombies faibles , 
	celui des moyens et celui des forts et on l'ajoute dans l'array des zombies de son type qui sont 
	sur le terrain. On le supprime ensuite de l'array d'initialsiationd'où il
	a été tiré grâce à shift().
	 */
	var arrayFiller= setInterval(function(){
		
		
		if(i===0){
			
			weakZombiesIN.push(weakZombies[0]);
		
			weakZombies.shift();
			
		}
		else if(i===1){
			
			mediumZombiesIN.push(mediumZombies[0]);
		
			mediumZombies.shift();
			
		}
		else if(i===2){
				
			strongZombiesIN.push(strongZombies[0]);
		
			strongZombies.shift();
			
				}
		enemiesIN=weakZombiesIN.concat(mediumZombiesIN,strongZombiesIN,bossZombiesIN);
	},2000)

	interv.push(arrayFiller);

	/*On refait donc la même chose à partir de 139 secondes pour augmenter la fréquence d'apparition des zombies.*/
	setTimeout(function(){
		var arrayFiller2 = setInterval(function(){
			var i=Math.floor(Math.random()*3);
			if(i===0){
				
				weakZombiesIN.push(weakZombies[0]);
				
				weakZombies.shift();
				
			}
			else if(i===1){
				
				mediumZombiesIN.push(mediumZombies[0]);
				
				mediumZombies.shift();
				
			}
			else if(i===2){
				
				strongZombiesIN.push(strongZombies[0]);
				
				strongZombies.shift();

				
				
			}
			var enemiesIN2=weakZombiesIN.concat(mediumZombiesIN,strongZombiesIN,bossZombiesIN);
		},2000)
		interv.push(arrayFiller2);
	},139000)
	/*A la 140ème seconde  on fait ensuite apparaître le Boss, la bande son normale est remplacée par
	 une autre plus "épique" pour les 60 dernières secondes de jeu, lorsque le Boss apparaît ,
	 on produit un rire grâce à une fonction présente plus bas.
	*/
	setTimeout(function(){
		var bandeSon=document.getElementById("bandeSon");
		var BossZombie=initBoss(Math.floor(Math.random()*550));
		
		bossZombiesIN.push(BossZombie);
		bandeSon.src="BossSon.ogg";
		bandeSon.load();
		playSound("laugh");
		
	},140000)
	
	/*Cette section de code gère le mouvement des zombies et justifie d'avoir  créé des arrays pour 
	chaque type de zombies
	ainsi toutes les 0.1s on fait avancer tous les zombies présent sur le canvas grâce à motion() et 
	selon l'array dans lequel il est , sa posture et 
	sa vitesse sont gérées automatiquement par la fonction présentée plus haut. Un zombie ne peut 
	avancer que s'il n'est pas mort donc si son attribut statu est à true .*/
	var motionHandler =setInterval(function(){
		createArea();
		for (i=0;i<weakZombiesIN.length;i++){
			if (weakZombiesIN[i].status===true){
				
				weakZombiesIN[i].motion(1);

			}
		}
		for (j=0;j<mediumZombiesIN.length;j++){
			if (mediumZombiesIN[j].status===true){
				
				mediumZombiesIN[j].motion(2);
			}
		}
		for (k=0;k<strongZombiesIN.length;k++){
			if (strongZombiesIN[k].status===true){
				
				strongZombiesIN[k].motion(3);
			}
		}
		for (l=0;l<bossZombiesIN.length;l++){
			if (bossZombiesIN[l].status===true){
				
				bossZombiesIN[l].motion(4);
			}
		}


		/* Cette section de code gère le fait qu'un zombie puisse enlever une vie àl'utilisateur ,
		 du coup lorsqu'un zombie arrive en bas du canvas (position 800) ,on l'ajoute à 
		 l'array enemiesHit dont la taille rpermet donc le nombre de vies restant à l'utilisateur . 
		 De plus on met le statut du zombie à false donc en théorie on le tue et on met sa position à 0 . 
		 Comme son statut est à false il n'avancera plus */
		for (var i=0;i<enemiesOnSet.length;i++){
			if (enemiesOnSet[i].posY>=800){
				enemyHits.push(enemiesOnSet[i]);
				enemiesOnSet[i].setStatus(false);
				enemiesOnSet[i].setPosY(0);
				break;
			}
	}
	},100)
	interv.push(motionHandler);
	
}

//  ---------------------------------- Gestion du tir

/*La fonction CheckHit prend en entrée une position de projectile "tiré" par l'utilisateur ainsi qu'un
 zombie et retourne un boolean à true si le zombie est touché et false s'il ne l'est pas .*/
zombie.checkHit =function(zomb,bulletX,bulletY){
	var zombX=this.getPosX();
	var zombY=this.getPosY();
	if(this.ID.substring(0,1)==="W"|| this.ID.substring(0,1)==="M"){
		if(bulletX>zombX-27 && bulletX<zombX+20 && bulletY>zombY-45 && bulletY<zombY+55){

			return true;
		}
		else{
			return false;
		}	
	}
	else if (this.ID.substring(0,1)==="S"){
		if(bulletX>zombX-37 && bulletX<zombX+50 && bulletY>zombY-37 && bulletY<zombY+60){

			return true;
		}
		else{
			return false;
		}	
	}
	else if (this.ID.substring(0,1)==="B"){
		if(bulletX>zombX-37 && bulletX<zombX+50 && bulletY>zombY-37 && bulletY<zombY+80){

			return true;
		}
		else{
			return false;
		}	
	}
}

/*La fonction  undertaker s'oocupe d'effacer les zombies tués par l'utilisateur en mettant leur statut
 à false et les ajoute à l'array enemiesKilled dont on se servira pour calculer le score du joueur*/
zombie.undertaker=function(){

	if (this.ID.substring(0,1)=="W"){
		this.setStatus(false);
		enemiesKilled.push(this);

	}
	else if(this.ID.substring(0,1)==="M"){
		this.setStatus(false);
		enemiesKilled.push(this);
	
	}
	else if(this.ID.substring(0,1)==="S"){
		this.setStatus(false);
		enemiesKilled.push(this);
			
	}
	else if(this.ID.substring(0,1)==="B"){
		this.setStatus(false);
		enemiesKilled.push(this);
	}
	this.setPosY(0);

}

/*La fonction switch change la couleur d'un zombie touché  , lorsque l'utilisateur tire sur un zombie 
il rougit .*/
zombie.switch =function(){
	var im=this.getImg();  
	this.setImg(this.hitImg);
	
}

/*La fonction gunshot gère l'évènement , l'utilisateur clique sur le canvas et le traite avec les
 trois fonctions ci-dessus pour diminuer ou non la santé d'un zombie par exemple . 
En aprticulier les zombies forts et les boss rugissent lorsqu'ils sont touchés par une balle .*/
function gunshot(event){
	playSound("gun");


  	var x = new Number();
	var y = new Number();
    

    if (event.x != undefined && event.y != undefined){
      x = event.x;
      y = event.y;
    }
    else {
      x = event.clientX + document.body.scrollLeft +
          document.documentElement.scrollLeft;
      y = event.clientY + document.body.scrollTop +
          document.documentElement.scrollTop;
    }

    x -= cs.offsetLeft;
    y -= cs.offsetTop;
	ctx.fillStyle="#ffce00";
	ctx.fillRect(x+15,y+15,5,5); // Dessin d'un petit carré orange pour un coup de feu 
    
    
    for (var i=0;i<enemiesOnSet.length;i++){
    	var checker=enemiesOnSet[i].checkHit(enemiesOnSet[i],x,y);
    
    	if(checker===true){
    		if (enemiesOnSet[i].type==="Boss"){playSound("roar");}
    		if (enemiesOnSet[i].type==="Strong"){playSound("strongRoar");}
    		enemiesOnSet[i].setHp(enemiesOnSet[i].Hp-1); 
    		enemiesOnSet[i].switch();

    		if (enemiesOnSet[i].getHp()===0){
    			enemiesOnSet[i].undertaker();
    		}
		}
	}
    
}


//  ---------------------------------- Gestion du temps de jeu
/*Cette section de code gère un timer et affiche le timer sur le canvas */
var time=0;
function timer(){
	ctx.clearRect(500,0,100,25);
		ctx.fillRect(500,0,100,25);

	var timer1=setInterval(function(){


		
		ctx.fillText("Time :"+(200-time),500,25);
		ctx.fillStyle="white";
	},1)
	interv.push(timer1);
	var timer2=setInterval(function(){
		time=time+1;
		console.log(time);
	},1000)
	interv.push(timer2);

}


//  ---------------------------------- Gestion du Score
/*Cette section de code utilise l'array des ennemies tués et leurs attributs reward pour calculer 
les points que le joueur gagne et ensuite les affiche en haut*/
function createScoreArea(){

	ctx.clearRect(300,0,100,25);

	ctx.fillRect(300,0,100,25);  
}


function scorer(){
	
	createScoreArea();
	var scoreInt=setInterval(function(){
		ctx.fillStyle="white";
		ctx.fillText("Score : "+ getScore(),250,25);
	},1)
	interv.push(scoreInt);
}

function getScore(){
	var score=0;
	for(var i=0;i<enemiesKilled.length;i++){
		score+=enemiesKilled[i].reward;
	}
	return score;
}

//  ---------------------------------- Gestion du nombre de vies
/*Cette section de code utilise l'array des zombies qui arrivent au bord du canvas pour calculer 
chaque fois le nombre de vie restant au joueur et
s'occupe aussi de l'affichage en haut du canvas*/
function createLifeArea(){

	ctx.clearRect(0,0,50,25);
	
	ctx.fillRect(0,0,50,25);  
}


function lifeViewer(){
	
	createScoreArea();
	var areaInt=setInterval(function(){
		ctx.fillStyle="white";
		ctx.fillText("Life : "+ getLifeCount(),20,25);
		if (getLifeCount()===0){
			stop("loss");
		}


	
	},1)
	interv.push(areaInt);
}

function getLifeCount(){
	var lifeCount=10;
	lifeCount-=enemyHits.length;
	return lifeCount;
}



//  ---------------------------------- Gestion du son
/*Cette section de code fournit les méthodes permettant de gérer les sources audio*/
function playSound(source){
	var sound=document.getElementById(source);
	sound.play();
}
function stopSound(source){
	var sound=document.getElementById(source);
	sound.pause()
	sound.currentTime=0
}
//  ---------------------------------- Gestion de la partie
/*Cette section de code permet de donner le comportement du jeu à la fin d'une partie selon que 
l'utilisateur a gagné ou pas , le son est différent selon les cas ,
des écrans affichent le nombre de vies restant et le score.*/
function stop(status){
	for (var i=0;i<interv.length;i++){
		clearInterval(interv[i]);
	}
	gameOn=false;
	ctx.clearRect(0,0,600,800);
	if (status==="win"){
		ctx.fillStyle="black";
		ctx.fillRect(0,0,600,800);
		ctx.drawImage(congrats,50,0);
		ctx.font="30px Arial";
		ctx.fillStyle="red";
		ctx.fillText("Final score: "+getScore(),50,500);
		ctx.fillText("Lifes remaining: "+getLifeCount(),50,550);
		stopSound("bandeSon");

		playSound("win");

	}
	else if(status==="loss"){
		ctx.fillStyle="red";
		ctx.fillRect(0,0,600,800);
		ctx.drawImage(lost,50,0);
		ctx.fillStyle="black";
		ctx.font="30px Arial";
		ctx.fillText("Final score: "+getScore(),50,500);
		stopSound("bandeSon");

			}	
}
//  ---------------------------------- Fonction de jeu
/*Cette fonction s'appuie sur toutes les fonctions décrites ci-desus pour faire fonctionner le jeu  ,
 on commence par créer le terrain de jeu , puis on remplit les arrays de zombies , 
on fait fonctionner le moteur de jeu et au bout de 200 secondes si le jeu est toujours en cours 
(c'est-à-dire que l'utilisateur n'a pas perdu toute ses vies) , il a gagné et on appelle la fonction de fin de partie .*/
function game(){		
	createArea();
	fillWeak();
	fillMedium();
	fillStrong();
	manager();
	setTimeout(function(){
		if(gameOn===true){
			stop("win");
		}
	},200000)
	
	
	
	
	
		
}