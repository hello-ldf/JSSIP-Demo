import JsSIP from 'jssip';

JsSIP.debug.enable("*")

let ua: any = null;
let currentSession: any = null;

const statusDiv = document.getElementById('status')!;
const registerBtn = document.getElementById('register-btn') as HTMLButtonElement;
const callBtn = document.getElementById('call-btn') as HTMLButtonElement;
const answerBtn = document.getElementById('answer-btn') as HTMLButtonElement;
const hangupBtn = document.getElementById('hangup-btn') as HTMLButtonElement;

function setStatus(msg: string, type: 'info' | 'success' | 'error' = 'info') {
  statusDiv.textContent = msg;
  statusDiv.className = '';
  
  switch (type) {
    case 'success':
      statusDiv.classList.add('status-connected');
      break;
    case 'error':
      statusDiv.classList.add('status-error');
      break;
    default:
      // 保持默认样式
      break;
  }
}

registerBtn.onclick = () => {
  const uri = (document.getElementById('sip-username') as HTMLInputElement).value;
  const password = (document.getElementById('sip-password') as HTMLInputElement).value;
  const wsServers = (document.getElementById('sip-server') as HTMLInputElement).value;

  if (!uri || !password || !wsServers) {
    setStatus('请填写所有必填字段', 'error');
    return;
  }

  try {
    if (ua) {
      ua.stop();
      ua = null;
    }

    console.log('正在初始化 JSSIP UA...', { uri, wsServers });

    ua = new JsSIP.UA({
      uri,
      password,
      sockets: [new JsSIP.WebSocketInterface(wsServers)],
      session_timers: false,
      register: true,
      register_expires: 300,
      connection_recovery_min_interval: 2,
      connection_recovery_max_interval: 30,
    });

    console.log('JSSIP UA 已创建:', ua);

    ua.on('connecting', () => {
      console.log('正在连接到服务器...');
      setStatus('正在连接...');
    });

    ua.on('connected', () => {
      console.log('已连接到服务器');
      setStatus('已连接到服务器');
    });

    ua.on('disconnected', () => {
      console.log('与服务器断开连接');
      setStatus('与服务器断开连接', 'error');
    });

    ua.on('registered', () => {
      console.log('注册成功');
      setStatus('注册成功', 'success');
    });

    ua.on('registrationFailed', (e: any) => {
      console.error('注册失败:', e);
      setStatus(`注册失败: ${e.cause}`, 'error');
    });

    ua.on('unregistered', () => {
      console.log('已注销');
      setStatus('已注销');
    });

    ua.on('newRTCSession', (e: any) => {
      console.log('新会话建立:', e);
      currentSession = e.session;
      
      // 检查是来电还是去电
      if (e.originator === 'remote') {
        console.log('收到来电');
        setStatus('收到来电，请点击接听', 'info');
        // 启用接听按钮
        answerBtn.disabled = false;
        callBtn.disabled = true;
      } else {
        console.log('发起呼叫');
        setStatus('会话建立');
        answerBtn.disabled = true;

        currentSession.connection.ontrack = (x: any) => {
          var remoteAudio = new window.Audio()
          remoteAudio.autoplay = true
          remoteAudio.srcObject = x.streams[0]
        }
      }
      
      currentSession.on('ended', () => {
        console.log('通话结束');
        setStatus('通话结束');
        currentSession = null;
        answerBtn.disabled = true;
        callBtn.disabled = false;
      });
      
      currentSession.on('failed', (e: any) => {
        console.error('通话失败:', e);
        setStatus(`通话失败: ${e.cause}`, 'error');
        currentSession = null;
        answerBtn.disabled = true;
        callBtn.disabled = false;
      });
      
      currentSession.on('accepted', () => {
        console.log('通话已接听');
        setStatus('通话已接听', 'success');
        answerBtn.disabled = true;
      });
      
      currentSession.on('confirmed', () => {
        console.log('通话已确认');
        setStatus('通话已确认', 'success');
        answerBtn.disabled = true;
      });
      
      currentSession.on('muted', () => {
        console.log('通话已静音');
        setStatus('通话已静音');
      });
      
      currentSession.on('unmuted', () => {
        console.log('通话已取消静音');
        setStatus('通话已取消静音');
      });
    });

    console.log('正在启动 UA...');
    ua.start();
    setStatus('正在注册...');
    
  } catch (error) {
    console.error('初始化失败:', error);
    setStatus(`初始化失败: ${error}`, 'error');
  }
};

callBtn.onclick = () => {
  console.log('呼叫按钮被点击');
  console.log('当前 UA 状态:', ua);
  
  if (!ua) {
    console.log('UA 不存在');
    setStatus('请先注册', 'error');
    return;
  }
  
  // 检查注册状态的多种方式
  const isRegistered = ua.registrator() && ua.registrator().registered;
  const isConnected = ua.isConnected && ua.isConnected();
  
  console.log('注册状态检查:', {
    isRegistered,
    isConnected,
    registratorRegistered: ua.registrator()?.registered
  });
  
  if (!isRegistered) {
    console.log('UA 未注册');
    setStatus('请先完成注册', 'error');
    return;
  }
  
  const target = (document.getElementById('sip-target') as HTMLInputElement).value;
  console.log('目标号码:', target);
  
  if (!target) {
    console.log('目标号码为空');
    setStatus('请输入目标号码', 'error');
    return;
  }

  try {
    console.log('开始创建呼叫会话...');
    
    // 定义事件处理器
    const eventHandlers = {
      'progress': function(data: any) {
        console.log('呼叫进行中...', data);
        setStatus('呼叫进行中...');
      },
      'failed': function(data: any) {
        console.error('呼叫失败:', data);
        setStatus(`呼叫失败: ${data.cause}`, 'error');
      },
      'confirmed': function(data: any) {
        console.log('呼叫已确认', data);
        setStatus('呼叫已确认', 'success');
      },
      'ended': function(data: any) {
        console.log('呼叫结束', data);
        setStatus('呼叫结束');
      },
      'accepted': function(data: any) {
        console.log('呼叫已接听', data);
        setStatus('呼叫已接听', 'success');
      }
    };
    
    // 定义呼叫选项
    const options = {
      eventHandlers: eventHandlers,
      mediaConstraints: { audio: true, video: false },
      // pcConfig: {
      //   iceServers: [
      //     { urls: ['stun:stun.l.google.com:19302'] }
      //   ]
      // }
    };
    
    console.log('呼叫参数:', { target, options });
    
    ua.call(target, options);
    
    setStatus('正在呼叫...');
    
  } catch (error) {
    console.error('呼叫失败:', error);
    setStatus(`呼叫失败: ${error}`, 'error');
  }
};

// 接听按钮事件处理
answerBtn.onclick = () => {
  console.log('接听按钮被点击');
  
  if (!currentSession) {
    console.log('没有待接听的会话');
    setStatus('没有待接听的会话', 'error');
    return;
  }
  
  try {
    console.log('正在接听通话...');
    currentSession.answer({
      mediaConstraints: { audio: true, video: false }
    });
    currentSession.connection.ontrack = (x: any) => {
      var remoteAudio = new window.Audio()
      remoteAudio.autoplay = true
      remoteAudio.srcObject = x.streams[0]
    }
    
    setStatus('已接听通话', 'success');
  } catch (error) {
    console.error('接听失败:', error);
    setStatus(`接听失败: ${error}`, 'error');
  }
};

hangupBtn.onclick = () => {
  if (currentSession) {
    try {
      console.log('正在挂断通话...');
      currentSession.terminate();
      setStatus('已挂断');
      currentSession = null;
    } catch (error) {
      console.error('挂断失败:', error);
      setStatus(`挂断失败: ${error}`, 'error');
    }
  } else {
    console.log('没有活动的通话');
    setStatus('没有活动的通话');
  }
};

// 页面加载时初始化按钮状态
answerBtn.disabled = true;
setStatus('准备就绪'); 