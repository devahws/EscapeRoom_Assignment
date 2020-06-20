
Function.prototype.member = function(name, value){
	this.prototype[name] = value
}

//////// Game Definition
function Game(){}
Game.start = function(room, welcome){
	game.start(room.id)
	printMessage(welcome)
}

Game.end = function(){
	game.clear()
}
Game.move = function(room){
	game.move(room.id)	
}

Game.handItem = function(){
	return game.getHandItem()
}


//////// Room Definition

function Room(name, background){
	this.name = name
	this.background = background
	this.id = game.createRoom(name, background)
}
Room.member('setRoomLight', function(intensity){
	this.id.setRoomLight(intensity)
})

//////// Object Definition

function Object(room, name, image){
	this.room = room
	this.name = name
	this.image = image

	if (room !== undefined){
		this.id = room.id.createObject(name, image)
	}
}
Object.STATUS = { OPENED: 0, CLOSED: 1, LOCKED: 2 }

Object.member('setSprite', function(image){
	this.image = image
	this.id.setSprite(image)
})
Object.member('resize', function(width){
	this.id.setWidth(width)
})
Object.member('setDescription', function(description){
	this.id.setItemDescription(description)
})

Object.member('getX', function(){
	return this.id.getX()
})
Object.member('getY', function(){
	return this.id.getY()
})
Object.member('locate', function(x, y){
	this.room.id.locateObject(this.id, x, y)
})
Object.member('move', function(x, y){
	this.id.moveX(x)
	this.id.moveY(y)
})

Object.member('show', function(){
	this.id.show()
})
Object.member('hide', function(){
	this.id.hide()
})
Object.member('open', function(){
	this.id.open()
})
Object.member('close', function(){
	this.id.close()
})
Object.member('lock', function(){
	this.id.lock()
})
Object.member('unlock', function(){
	this.id.unlock()
})
Object.member('isOpened', function(){
	return this.id.isOpened()
})
Object.member('isClosed', function(){
	return this.id.isClosed()
})
Object.member('isLocked', function(){
	return this.id.isLocked()
})
Object.member('pick', function(){
	this.id.pick()
})
Object.member('isPicked', function(){
	this.id.isPicked()
})

//////// Door Definition

function Door(room, name, closedImage, openedImage, connectedTo){
	Object.call(this, room, name, closedImage)

	// Door properties
	this.closedImage = closedImage
	this.openedImage = openedImage
	this.connectedTo = connectedTo
}
// inherited from Object
Door.prototype = new Object()

Door.member('onClick', function(){
	if (!this.id.isLocked() && this.id.isClosed()){
		this.id.open()
	}
	else if (this.id.isOpened()){
		if (this.connectedTo !== undefined){
			Game.move(this.connectedTo)
		}
		else {
			Game.end()
		}
	}
})
Door.member('onOpen', function(){
	this.id.setSprite(this.openedImage)
})
Door.member('onClose', function(){
	this.id.setSprite(this.closedImage)
})


//////// Keypad Definition

function Keypad(room, name, image, password, callback){
	Object.call(this, room, name, image)

	// Keypad properties
	this.password = password
	this.callback = callback
}
// inherited from Object
Keypad.prototype = new Object()

Keypad.member('onClick', function(){
	showKeypad('number', this.password, this.callback)
})


//////// DoorLock Definition
function DoorLock(room, name, image, password, door, message){
	Keypad.call(this, room, name, image, password, function(){
		printMessage(message)
		door.unlock()
	})
}
// inherited from Object
DoorLock.prototype = new Keypad()

/////// Item Definition

function Item(room, name, image){
	Object.call(this, room, name, image)
}
// inherited from Object
Item.prototype = new Object()

Item.member('onClick', function(){
	this.id.pick()
})
Item.member('isHanded', function(){
	return Game.handItem() == this.id
})

//Swtich definition
function Switch(room, name, image){
	Object.call(this, room, name, image)
}

Switch.prototype = new Object()
Switch.member('onClick', function(){
	printMessage("사라진 대원들이 실험체로 사용되고 있었다..!")
	lab.setRoomLight(1.0)
})

// Button definition
function Button(room, name, image){
	Object.call(this, room, name, image)
}
Button.prototype = new Object()
Button.member('onClick', function(){
	printMessage("탈출통로에서 철커덩하는 소리가 들렸다!")
	e_aisle.h_door.show()
})

// ChianLock definition
function ChainLock(room, name, image){
	Object.call(this, room, name, image)
}
ChainLock.prototype = new Object()


// game setting
// this.id = game.createRoom(name, background)
game.setTimer(600, 600, '')
game.startTimer()

m_aisle = new Room('m_aisle', '복도.png') 		// 메인 복도
m_cockpit = new Room('m_cockpit', '관제소.png') // 메인 관제소
m_room = new Room('m_room', "방.png") 			// 생활관
e_aisle = new Room('e_aisle', '비상통로.png') 	// 비상 통로
e_ship = new Room('e_ship', '조종석.png') 		// 비상 탈출선
lab = new Room('lab', '실험실.png') 			// 실험실


					/* m_aisle 구성  */

// m_aisle -> m_room으로 연결되는 문 생성
m_aisle.r_door = new Door(m_aisle, 'r_door', '통로문-오른쪽.png','통로문-오른쪽.png',m_room)
m_aisle.r_door.resize(180) // 
m_aisle.r_door.locate(1150,410) //

// m_aisle -> e_aisle로 연결되는 문 생성
m_aisle.e_door = new Door(m_aisle, 'e_door', '통로문-왼쪽.png', '통로문-왼쪽.png', e_aisle)
m_aisle.e_door.resize(180) //
m_aisle.e_door.locate(250,380)

// m_aisle -> m_cockpit으로 연결되는 문 생성
m_aisle.c_arrow = new Door(m_aisle, 'c_arrow', '화살표-아래.png', '화살표-아래.png', m_cockpit)
m_aisle.c_arrow.resize(60)
m_aisle.c_arrow.locate(960,600)
m_aisle.c_arrow.onClick = function(){
	if (m_room.helmet.isHanded() && this.id.isClosed()){
		this.id.open()
		Game.move(this.connectedTo)
	} else {
		printMessage("조종실에 산소가 부족해 들어갈 수 없다.. 헬멧을 찾아서 착용하자")
	}
}


			/*       m_cockpit 구성        */
m_cockpit.m_arrow = new Door(m_cockpit, 'm_arrow', '화살표-아래.png', '화살표-아래.png', m_aisle)
m_cockpit.m_arrow.resize(60)
m_cockpit.m_arrow.locate(640,630)

// 비밀문 오픈 스위치
m_cockpit.button = new Item(m_cockpit, 'button', '포스트잇.png')
m_cockpit.button.resize(30)
m_cockpit.button.locate(850, 500)
m_cockpit.button.onClick = function(){
	showKeypad("alphabet", "STAYA", function(){
		e_aisle.h_door.show()
		printMessage("탈출 통로에서 쿵 하는 소리가 들렸다!")
	})
}

// 계기판 
m_cockpit.f_board = new Item(m_cockpit, 'f_board', '계기판.png')
m_cockpit.f_board.resize(70)
m_cockpit.f_board.locate(320, 540)
m_cockpit.f_board.onClick = function(){
	printMessage("남은 산소량: "+game.getLeftTime())  
}

// 모니터
m_cockpit.monitor = new Item(m_cockpit, 'monitor', '맥-우.png')
m_cockpit.monitor.resize(90)
m_cockpit.monitor.locate(970, 520)
m_cockpit.monitor.onClick = function(){
	if( !m_cockpit.usb.isHanded()){
		showVideoPlayer("https://www.youtube.com/watch?v=k94emBOFABM")
		printMessage("컴퓨터를 건드리니 꽂혀있던 USB가 바닥에 떨어졌다.")
		m_cockpit.usb.show()
	} else {
		showVideoPlayer("https://www.youtube.com/watch?v=k94emBOFABM")
	}

}

// USB
m_cockpit.usb = new Item(m_cockpit, 'usb', '유에스비.png')
m_cockpit.usb.resize(60)
m_cockpit.usb.locate(960, 670)
m_cockpit.usb.hide()

			/* 		 m_room 구성			*/
// 통로로 가는 문
m_room.m_arrow = new Door(m_room, 'm_arrow', '화살표-좌.png', '화살표-좌.png', m_aisle)
m_room.m_arrow.resize(100)
m_room.m_arrow.locate(150,250)

// 캐비닛 자물쇠
m_room.chain = new ChainLock(m_room, 'chain', '숫자키-우.png')
m_room.chain.resize(50)
m_room.chain.locate(760,460)
m_room.chain.onClick = function(){
	if (m_room.c_key.isHanded()){
		printMessage("Apollo Project11, MOON, Year")
		showKeypad("number", "1969", function(){
			m_room.helmet.show()
			printMessage("자물쇠가 풀리자 캐비닛 안에 있던 우주복 헬멧이 굴러떨어졌다.")
		})
	} else {
		printMessage("도어락이 잠겨있다. 열쇠가 필요할 것 같다.")
	}
}

// 캐비닛 키
m_room.c_key = new Item(m_room, 'c_key', '열쇠.png')
m_room.c_key.resize(40)
m_room.c_key.locate(320, 600)
m_room.c_key.hide()

// 일기장
m_room.diary = new Item(m_room, 'diary', '일기장.png')
m_room.diary.onClick = function(){
	showImageViewer("책페이지.png", "일기.txt");
}
m_room.diary.resize(90)
m_room.diary.locate(320,490)

// 국기
m_room.flag = new Item(m_room, 'flag', '국기.png')
m_room.flag.resize(80)
m_room.flag.locate(525, 360)
m_room.flag.onClick = function(){
	printMessage("선장은 벨기에 사람이었다..")
}

// 우주복 헬멧
m_room.helmet = new Item(m_room, 'helmet', '헬멧.png')
m_room.helmet.resize(180)
m_room.helmet.locate(320, 640)
m_room.helmet.hide()

// 쓰레기통
m_room.trash = new Item(m_room, 'trash', '쓰레기통-우-닫힘.png')
m_room.trash.resize(180)
m_room.trash.locate(95,540)
m_room.trash.onClick = function(){
	if( m_room.trash.isClosed() && !m_room.c_key.isPicked() ){
		printMessage("쓰레기통에 껴있던 열쇠가 떨어졌다.")
		m_room.trash.setSprite("쓰레기통-우-열림.png")
		m_room.trash.open()
		m_room.c_key.show()
	} else if (m_room.trash.isOpened()){
		m_room.trash.close()
		this.id.setSprite('쓰레기통-우-닫힘.png')
	} else if (m_room.trash.isClosed() && m_room.c_key.isPicked()){
		this.id.setSprite('쓰레기통-우-열림.png')
	}
}

			/*         e_aisle 구성					*/
// 비상구조선으로 들어가는 문
e_aisle.e_door = new Door(e_aisle, 'e_door', '비상통로문.png', '비상통로문.png', e_ship)
e_aisle.e_door.onClick = function(){
	if (this.id.isLocked()){
		printMessage("문이 잠겨있다.. 주변에 도어락도 보이지 않는다..")
	} else if (!this.id.isLocked() && this.id.isClosed()){
		this.id.open()
	}
	else if (this.id.isOpened()){
		if (this.connectedTo !== undefined){
			Game.move(this.connectedTo)
		}
		else {
			Game.end()
		}
	}
}
e_aisle.e_door.resize(150)
e_aisle.e_door.locate(640,400)
e_aisle.e_door.lock()

// 비상구조문 도어락
e_aisle.doorlock = new Item(e_aisle, 'doorlock', '키패드-우.png')
e_aisle.doorlock.resize(30)
e_aisle.doorlock.locate(735, 380)
e_aisle.doorlock.onClick = function(){
	printMessage("스페이스 오디세이 OOOO")
	showKeypad("number", "2001", function(){
		e_aisle.e_door.open()
		printMessage("탈출선의 문이 열리는 소리가 들렸다!")
})}

e_aisle.doorlock.hide()

// 복도로 돌아가는 화살표
e_aisle.m_arrow = new Door(e_aisle, 'm_arrow', '화살표-아래.png', '화살표-아래.png', m_aisle)
e_aisle.m_arrow.resize(50)
e_aisle.m_arrow.locate(940,640)

// 비밀문 생성
e_aisle.h_door = new Door(e_aisle, 'h_door', '비밀문.png', '비밀문.png', lab)
e_aisle.h_door.resize(250)
e_aisle.h_door.locate(640,560)
e_aisle.h_door.hide()

			/*      lab 구성    */
lab.e_arrow = new Door(lab, 'e_arrow', '화살표-좌.png', '화살표-좌.png', e_aisle)
lab.e_arrow.resize(100)
lab.e_arrow.locate(200,600)
lab.setRoomLight(0.3)

// 실험실 밝히는 스위치
lab.switch = new Switch(lab, 'switch', '포스트잇.png')
lab.switch.resize(30)
lab.switch.locate(70,320)

// 탈출선 문 개방 포트
lab.remote = new Item(lab, 'remote', '포트.png')
lab.remote.resize(120)
lab.remote.locate(685, 440)
lab.remote.onClick = function(){
	if( m_cockpit.usb.isHanded()){
		printMessage("비상 통로에서 어떤 소리가 들렸다!")
		e_aisle.doorlock.show()
	} else {
		printMessage("포트에 알맞은 USB를 꽂아야 할 것 같다..")
	}
}

				/* 		e_ship 구성		*/
// 통로로 돌아가는 문
e_ship.e_arrow = new Door(e_ship, 'e_arrow', '화살표-아래.png', '화살표-아래.png', e_aisle)
e_ship.e_arrow.resize(50)
e_ship.e_arrow.locate(1000,660)

var CountButtonClick = [0,0,0]

// 노랑 버튼
e_ship.y_button = new Item(e_ship, 'y_button', '노랑버튼.png')
e_ship.y_button.resize(24)
e_ship.y_button.locate(608, 658)
e_ship.y_button.onClick = function(){
	CountButtonClick.unshift("Y")
	CountButtonClick.pop()
	printMessage(CountButtonClick[0]+CountButtonClick[1]+CountButtonClick[2])} 

// 빨강 버튼	
e_ship.r_button = new Item(e_ship, 'r_button', '빨강버튼.png')
e_ship.r_button.resize(24)
e_ship.r_button.locate(672, 658)
e_ship.r_button.onClick = function(){
	CountButtonClick.unshift("R")
	CountButtonClick.pop()
	printMessage(CountButtonClick[0]+CountButtonClick[1]+CountButtonClick[2])} 

// 검정 버튼
e_ship.b_button = new Item(e_ship, 'b_button', '검정버튼.png')
e_ship.b_button.resize(24)
e_ship.b_button.locate(640, 658)
e_ship.b_button.onClick = function(){
	CountButtonClick.unshift("B")
	CountButtonClick.pop()
	printMessage(CountButtonClick[0]+CountButtonClick[1]+CountButtonClick[2])
}  

// 비상 탈출선 안내문
e_ship.notice = new Item(e_ship, 'notice', '안내.png')
e_ship.notice.resize(90)
e_ship.notice.locate(370,650)
e_ship.notice.onClick = function(){
	showImageViewer("안내보드.png", "메뉴얼.txt")
}

// 우주복 상하의
e_ship.suit = new Item(e_ship, 'suit', 'suit.png')
e_ship.suit.resize(300)
e_ship.suit.locate(200,600)
e_ship.suit.hide()

// 천장
e_ship.ceil = new Item(e_ship, 'ceil', '천장뚜껑.png')
e_ship.ceil.resize(400)
e_ship.ceil.locate(185, 200)
e_ship.ceil.onClick = function(){
	printMessage("천장에서 먼지가 가득 쌓인 우주복이 떨어졌다.")
	e_ship.suit.show()
}

// 최종 탈출 버튼
e_ship.toggle = new Item(e_ship, 'toggle', 'toggle.png')
e_ship.toggle.resize(130)
e_ship.toggle.locate(640,510)
e_ship.toggle.onClick = function(){
	if((CountButtonClick[0]=="B") && (CountButtonClick[1]=="Y") && (CountButtonClick[2]=="R")){ // 벨기에 국기 색 순서대로 배열을 완성
		if(e_ship.suit.isHanded()){
			printMessage("비상 탈출선이 본체에서 분리되었다.")
			Game.end()
		} else {
			printMessage("우주복을 입고있어야 합니다.")}
		
	} else {
		printMessage("버튼을 알맞은 순서로 눌러주세요.")
	}
}

/* Game Start */
Game.start(m_aisle, '눈을 떠보니 우주선 복도에 쓰러져 있었다..')
