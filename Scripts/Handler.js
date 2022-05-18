'use-strict';
var Typers = { }, MyIdx = -1,
Actives = { }, IsDebug = false,
SocketRoom = null, Reply = { Active: false },
TBFocus = () => setTimeout(() => $('.control-box input').focus(), 50);
const Servers = { 'Koyeb': 'wss://chatley-techzy-programmer.koyeb.app/', 'Fly': 'wss://chatley-server.fly.dev/'};

Dragger.Initiate();
Toast.setOptions({
	onHide: "vanishOut",
	onShow: "vanishIn",
	timelife: true,
	delay: 4,
});

if (IsDebug)
{
	Actives[1] = { N: 'User-1', C: '#b9f0f9' };
	Actives[2] = { N: 'User-2', C: '#bcb9f9' };
	Actives[3] = { N: 'User-3', C: '#f9b9b9' };
	Actives[4] = { N: 'User-4', C: '#b9f0f9' };
	Actives[0] = { N: 'You', C: '#a8ffb3', Me: 1 };
}

new Toast("info", "Welcome To Chatley");

$('span.reply-box > .close-icon').on('click', (ClkEvt) =>  {
	$('span.reply-box.bottom').removeClass('active');
	ClkEvt.stopPropagation();
	Reply.Active = false;
	TBFocus();
});

function AddEvent(ETxt, EType = 1)
{
	const EBubble = $('<div>', { class:
		`event ${EType == 1 ? '' : (!EType) ? 'r' : 'g'}` });
	EBubble.text(ETxt); EBubble.appendTo($('div.messages'));
}

function Insert(SrId, IMsg, RepData, MgId = 'm0')
{
	if ($.trim(IMsg) != "")
	{
		var TargetBox, IsRepable = (typeof RepData?.Who != 'undefined' && RepData?.Who != null
		&& (TargetBox = $(`div.message[msgid="${RepData?.MsgId}"]`)).length);
		const UserNm = Actives[SrId]['N'], UColor = Actives[SrId]['C'];
		let SenderElem = $('<div>', { class: 'sender' }),
		MsgElem = $('<b>'), LastClick = 0,
		MsgsHolder = $('div.messages'),
		MsgBubble = $('<div>',
		{
			msgid: MgId, usrid: SrId,
			class: `message ${(Actives[SrId]['Me'] ? "personal" : "")}`,
			style: `background: ${UColor}; margin-top: ${IsRepable ? '50px' : '5px'}; ${IsRepable ? 'min-width: 200px;' : ''}`
		});

		if (IsRepable)
		{
			let RpSender = Actives[RepData.Who];
			const RpBox = $('<span>',
			{
				class: 'reply-box',
				style: `background: ${RpSender['C']}db;`
			});

			RpBox.html(`<b>${RpSender['N']}</b><hr>
			<i>${TargetBox.children('b').text()}</i>`);
			RpBox.appendTo(MsgBubble);

			RpBox.on('click', (CEvt) => {
				CEvt.stopPropagation(); RpBox.addClass('click');
				setTimeout(() => RpBox.removeClass('click'), 150);
				
				let TOut = 0;
				function ScrollHit()
				{
					clearTimeout(TOut);
					TOut = setTimeout(() =>
					{
						$('div.messages').off('scroll', ScrollHit);
						TargetBox.removeClass('noanim').addClass('flash');
						setTimeout(() => TargetBox.addClass('noanim').removeClass('flash'), 900);
					}, 50);
				}

				ScrollHit();
				$('div.messages').on('scroll', ScrollHit);
				TargetBox[0].scrollIntoView({ behavior: "smooth", block: "center" });
			});
		}

		MsgElem.text(IMsg);
		SenderElem.text(UserNm);
		MsgElem.appendTo(MsgBubble);
		SenderElem.appendTo(MsgBubble);
		MsgBubble.appendTo(MsgsHolder);

		MsgBubble.on('click', function()
		{
			TBFocus();
			if ($(this).hasClass('blocked')) return;
			if (LastClick && Date.now() - LastClick <= 500)
			{
				if (typeof Actives[SrId] == 'undefined')
				{
					new Toast('warn', `Can't Reply to This Msg, 
					Sender Disconnected!`);
					return;
				}
				
				LastClick = 0;
				Reply.Who = SrId;
				Reply.MsgId = MgId;
				Reply.Active = true;
				$('span.reply-box.bottom i').text(IMsg);
				$('span.reply-box.bottom').addClass('active');
				$('span.reply-box.bottom').css('background', `${UColor}db`);
			}
			else LastClick = Date.now();
		});

		MsgsHolder[0].scrollTo({
			top: MsgsHolder[0].scrollHeight,
			behavior: 'smooth'
		});
	}
}

function TryConnect()
{
	let Pinger = 0, NoOne = 1, TypIVal = 0;
	const UName = $('.settings input').val();
	if (UName.length < 2) new Toast("warn", "Name Too Short");
	else if (UName.length > 20) new Toast("warn", "Name Too Big");
	else if (!SocketRoom || SocketRoom?.readyState != 1)
	{
		Dragger.Toggle('Connecting');
		$('.settings').addClass('hide');
		$('.settings input').attr('disabled', true);
		SocketRoom = new WebSocket(Servers['Koyeb']);

		function StatusToggle(ToDisable = false)
		{
			if (ToDisable)
			{
				NoOne = 1;
				$('.control-box input').val('');
				$('.control-box input').attr('disabled', true);
				$('.control-box input').attr('placeholder', 'Waiting for others to join...');
				Dragger.Toggle('All Users Left, Waiting For Someone To Join Your Chat Session....');
			}
			else
			{
				TBFocus();
				$('.control-box input').removeAttr('disabled');
				NoOne && setTimeout(() => { NoOne = 0; Dragger.Toggle(); }, 2000);
				$('.control-box input').attr('placeholder', 'Type message & hit enter to send');
			}
		}

		SocketRoom.onopen = () =>
		{
			$('.messages').empty();
			Actives = { }; Typers = { };
			new Toast("info", "Connected Successfully!");
			AddEvent('Chat is Secured over TLS connection');
			Dragger.Toggle('Waiting for Users to Join....');
			if (!Fullscreen.isFullscreen) Fullscreen.goFullscreen(document.documentElement);
		};

		SocketRoom.onmessage = (Msg) =>
		{
			clearTimeout(Pinger);
			let UData = JSON.parse(Msg.data);
			Pinger = setTimeout(() => SocketRoom.close(), 20 * 1000);

			switch (UData.Type)
			{
				case 'Users':
					StatusToggle();
					let CLen = UData.Users.length, SorP, SP;
					if (CLen > 1) { SorP = 'are'; SP = 's'; }
					else if (CLen == 1) { SorP = 'is'; SP = ''; }
					AddEvent(`${CLen} User${SP} ${SorP} Available`);
					new Toast('info', `${CLen} User${SP} ${SorP} Available`);
					UData.Users.forEach((UObj) => Actives[UObj.I] = { N: UObj.N, C: UObj.C });
					break;

				case 'Joined':
					StatusToggle();
					AddEvent(`${UData.Who.N} Joined`, 2);
					new Toast("info", `${UData.Who.N} Joined`);
					Actives[UData.Who.I] = { N: UData.Who.N, C: UData.Who.C };
					break;

				case 'Left':
					if (Actives[UData.Who])
					{
						AddEvent(`${Actives[UData.Who]['N']} Left`, 0);
						new Toast("warn", `${Actives[UData.Who]['N']} Left`);
						delete Actives[UData.Who]; delete Typers[UData.Who];
						if (!Object.keys(Typers).length) Dragger.Toggle();
						if (Object.keys(Actives).length <= 1)
						{
							StatusToggle(true);
							Typers = { };
						}
					}
					break;
				
				case 'YourID':
					MyIdx = UData.Id;
					AddEvent(`'You' Joined`, 2);
					Actives[MyIdx] = { N: 'You', C: '#a8ffb3', Me: 1 };
					break;

				case 'Typing':
					Typers[UData.Who] = Object.create(Actives)[UData.Who]['N'];
					let TprsUC = Object.keys(Typers);

					TypIVal = setInterval(() =>
					{
						if (!Object.keys(Typers).length)
						{
							Dragger.Toggle();
							clearInterval(TypIVal);
						}
					}, 2000);

					if (TprsUC.length <= 3)
					{
						let TmpUss = '';
						switch (TprsUC.length)
						{
							case 1: TmpUss = Typers[TprsUC[0]] + ' Is'; break;
							case 2: TmpUss = `${Typers[TprsUC[0]]} & ${Typers[TprsUC[1]]} Are`; break;
							case 3: TmpUss = `${Typers[TprsUC[0]]}, ${Typers[TprsUC[1]]} & ${Typers[TprsUC[2]]} Are`; break;
						}

						TmpUss += " Typing....";
						Dragger.Toggle(TmpUss);
					}
					else Dragger.Toggle(`${TprsUC.length} Users Are Typing....`);
					break;

				case 'Typing-End':
					delete Typers[UData.Who];
					if (!Object.keys(Typers).length) Dragger.Toggle();
					break;

				case 'Warn':
					new Toast('warn', UData.Detail);
					if (UData.Id)
					{
						let BanMsg = $(`div.message.personal[msgid="${UData.Id}"]`);
						if (BanMsg.length)
						{
							if (BanMsg.children('.reply-box').length)
							{
								BanMsg.children('.reply-box').remove();
								BanMsg.css('margin-top', '5px');
							}

							BanMsg.addClass('blocked'); BanMsg.children('.sender').text('Message Not Sent');
							BanMsg.children('b').text(UData.Ban == 0 ? '🤬 (ABUSE DETECTED)' : '😡 (TOO MANY MESSAGES)');
						}
					}
					break;

				case 'Ping': Emit({ Type: 'Pong' }); break;
				case 'Error': new Toast('error', UData.Detail); break;
				case 'Room-Full': new Toast('error', 'Room Is Full'); break;
				case 'Acknowledge': Emit({ Type: 'Metadata', Name: UName }); break;
				case 'Chat': Insert(UData.From, UData.Msg, UData.Reply, UData.Id); break;
			}
		};

		SocketRoom.onclose = (E) =>
		{
			NoOne = 1;
			Actives = { };
			Dragger.Toggle();
			clearInterval(TypIVal);
			$('.settings').removeClass('hide');
			new Toast("error", "Connection terminated");
			$('.settings input').removeAttr('disabled');
			$('.control-box input').attr('disabled', true);
			if (Fullscreen.isFullscreen) Fullscreen.exitFullscreen();
		};
	}
}

function Emit(JDat)
{
	if (SocketRoom && SocketRoom.readyState == SocketRoom.OPEN)
		SocketRoom.send(JSON.stringify(JDat));
	else SocketRoom?.close();
}

function SendMsg()
{
	TBFocus();
	const BoxChat = $('.control-box input').val();
	if (BoxChat.trim() == '') $('.control-box input').val('');
	else if (BoxChat.length > 2048) new Toast('warn', 'Large Message Not Allowed');
	else
	{
		let RepSnd = 0,
		UnqId = 'm' + Date.now();

		$('.control-box input').val('');
		if (Reply.Active) RepSnd = [Reply.Who, Reply.MsgId];
		Insert(MyIdx, BoxChat, Reply.Active ? Reply : null, UnqId);
		Emit({ Type: 'Msg', Chat: BoxChat, Id: UnqId, Reply: RepSnd });
		if (Reply.Active) $('span.reply-box.bottom > b').click(); // Needs to come later to prevent Reply.Active from getting false
	}
}
