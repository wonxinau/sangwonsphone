/**
 * SANGWON'S PHONE - Main Application Script
 * Vanilla JavaScript • Data-driven • ALD1 Idol Romance
 */

(() => {
  'use strict';

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const state = {
    config: null,
    chats: null,
    currentScreen: 'lock', // 'lock', 'home', 'app'
    activeApp: null, // 'messages', 'photos', 'notes', 'phone', 'settings'
    soundEnabled: true,
    lockPinBuffer: '',
    notePinBuffer: '',
    currentViewerIndex: 0,
    currentViewerList: null,
    activePhotosTab: 'all',
    notificationTriggered: false,
    notificationTimeout: null,
    activeChatId: null,
    activeNoteId: null,
    isVoicemailPlaying: false,
    audioCtx: null
  };

  // =========================================================================
  // AUDIO SYNTHESIZER (Web Audio API - Zero External Dependencies)
  // =========================================================================
  const SoundFx = {
    init() {
      if (!state.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          state.audioCtx = new AudioContext();
        }
      }
      if (state.audioCtx && state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }
    },

    tap() {
      if (!state.soundEnabled) return;
      this.init();
      if (!state.audioCtx) return;
      try {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, state.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, state.audioCtx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.08, state.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, state.audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(state.audioCtx.destination);
        osc.start();
        osc.stop(state.audioCtx.currentTime + 0.03);
      } catch (e) {}
      if (navigator.vibrate) navigator.vibrate(10);
    },

    unlock() {
      if (!state.soundEnabled) return;
      this.init();
      if (!state.audioCtx) return;
      try {
        const now = state.audioCtx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = state.audioCtx.createOscillator();
          const gain = state.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.12, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);
          osc.connect(gain);
          gain.connect(state.audioCtx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.22);
        });
      } catch (e) {}
      if (navigator.vibrate) navigator.vibrate([15, 30, 20]);
    },

    error() {
      if (!state.soundEnabled) return;
      this.init();
      if (!state.audioCtx) return;
      try {
        const now = state.audioCtx.currentTime;
        [220, 196].forEach((freq, idx) => {
          const osc = state.audioCtx.createOscillator();
          const gain = state.audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.1, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.12);
          osc.connect(gain);
          gain.connect(state.audioCtx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.12);
        });
      } catch (e) {}
      if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
    },

    notification() {
      if (!state.soundEnabled) return;
      this.init();
      if (!state.audioCtx) return;
      try {
        const now = state.audioCtx.currentTime;
        const notes = [587.33, 880.00];
        notes.forEach((freq, idx) => {
          const osc = state.audioCtx.createOscillator();
          const gain = state.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.15, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(state.audioCtx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.35);
        });
      } catch (e) {}
      if (navigator.vibrate) navigator.vibrate([20, 50, 30]);
    },

    dial(val) {
      if (!state.soundEnabled) return;
      this.init();
      if (!state.audioCtx) return;
      try {
        const osc1 = state.audioCtx.createOscillator();
        const osc2 = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc1.frequency.setValueAtTime(697, state.audioCtx.currentTime);
        osc2.frequency.setValueAtTime(1209, state.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, state.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, state.audioCtx.currentTime + 0.15);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(state.audioCtx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(state.audioCtx.currentTime + 0.15);
        osc2.stop(state.audioCtx.currentTime + 0.15);
      } catch (e) {}
      if (navigator.vibrate) navigator.vibrate(12);
    }
  };

  // =========================================================================
  // BOOTSTRAP & INITIALIZATION
  // =========================================================================
  async function initApp() {
    try {
      const [configRes, chatsRes] = await Promise.all([
        fetch('data/config.json').then(r => r.json()),
        fetch('data/chats.json').then(r => r.json())
      ]);
      state.config = configRes;
      state.chats = chatsRes;
    } catch (e) {
      console.warn('Data fetch fallback:', e);
    }

    applyConfig();
    setupEventListeners();
    setupPhotosApp();
    setupNotesApp();
    setupMessagesApp();
    setupPhoneApp();
    registerServiceWorker();

    console.log("Sangwon's Phone initialized. Love PIN:", state.config?.owner?.pin || '0520');
  }

  function applyConfig() {
    if (!state.config) return;
    const { owner, notification } = state.config;

    document.getElementById('status-time').textContent = owner.clockTime;
    document.getElementById('lock-time').textContent = owner.clockTime;
    document.getElementById('lock-date').textContent = owner.clockDate;
    document.getElementById('status-carrier').textContent = owner.carrier;
    document.getElementById('status-battery-text').textContent = `${owner.batteryLevel}%`;
    document.getElementById('status-battery-fill').style.width = `${owner.batteryLevel}%`;

    const parts = owner.clockDate.split(' ');
    if (parts.length >= 3) {
      document.getElementById('widget-day').textContent = parts[0].substring(0, 3).toUpperCase();
      document.getElementById('widget-date-num').textContent = parts[2].replace(',', '');
    }

    if (owner.pinHint) {
      document.getElementById('lock-hint-text').textContent = owner.pinHint;
    }

    if (notification) {
      document.getElementById('notif-app-name').textContent = notification.appName || 'MESSAGES';
      document.getElementById('notif-title').textContent = notification.sender || 'Anxinie 🤍';
      document.getElementById('notif-message').textContent = notification.preview || '';
      if (notification.avatar) {
        document.getElementById('notif-avatar-img').src = notification.avatar;
      }
    }
  }

  // =========================================================================
  // LOCK SCREEN PIN LOGIC
  // =========================================================================
  function handleLockKeypress(key) {
    if (state.currentScreen !== 'lock') return;
    if (state.lockPinBuffer.length >= 4) return;

    SoundFx.tap();
    state.lockPinBuffer += key;
    updatePinDots();

    if (state.lockPinBuffer.length === 4) {
      setTimeout(verifyLockPin, 120);
    }
  }

  function handleLockDelete() {
    if (state.lockPinBuffer.length > 0) {
      SoundFx.tap();
      state.lockPinBuffer = state.lockPinBuffer.slice(0, -1);
      updatePinDots();
    }
  }

  function updatePinDots() {
    const dots = document.querySelectorAll('#pin-dots .pin-dot');
    dots.forEach((dot, idx) => {
      if (idx < state.lockPinBuffer.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  function verifyLockPin() {
    const targetPin = (state.config && state.config.owner && state.config.owner.pin) || '0520';
    const pinDots = document.getElementById('pin-dots');

    if (state.lockPinBuffer === targetPin) {
      // SUCCESS!
      SoundFx.unlock();
      const padlock = document.getElementById('lock-padlock');
      padlock.classList.add('unlocking');

      setTimeout(() => {
        unlockPhone();
      }, 250);
    } else {
      // WRONG PIN!
      SoundFx.error();
      pinDots.classList.add('shake');

      setTimeout(() => {
        pinDots.classList.remove('shake');
        state.lockPinBuffer = '';
        updatePinDots();
      }, 500);
    }
  }

  function unlockPhone() {
    const lockScreen = document.getElementById('lock-screen');
    const homeScreen = document.getElementById('home-screen');

    lockScreen.classList.remove('active');
    lockScreen.classList.add('unlocked');
    homeScreen.classList.add('active');

    state.currentScreen = 'home';
    state.lockPinBuffer = '';
    updatePinDots();

    // Trigger Notification Banner after 2.0s
    if (!state.notificationTriggered) {
      const delay = (state.config.notification && state.config.notification.delayMs) || 2000;
      state.notificationTimeout = setTimeout(() => {
        showPushNotification();
      }, delay);
    }
  }

  function lockPhone() {
    clearTimeout(state.notificationTimeout);
    closeCurrentApp();
    hidePushNotification();

    const lockScreen = document.getElementById('lock-screen');
    const homeScreen = document.getElementById('home-screen');
    const padlock = document.getElementById('lock-padlock');

    padlock.classList.remove('unlocking');
    homeScreen.classList.remove('active');
    lockScreen.classList.remove('unlocked');
    lockScreen.classList.add('active');

    state.currentScreen = 'lock';
    state.lockPinBuffer = '';
    updatePinDots();
    SoundFx.tap();
  }

  // =========================================================================
  // NOTIFICATION BANNER LOGIC
  // =========================================================================
  function showPushNotification() {
    state.notificationTriggered = true;
    const banner = document.getElementById('notification-banner');
    banner.classList.add('visible');
    SoundFx.notification();

    const badge = document.getElementById('messages-badge');
    badge.textContent = '1';
    badge.classList.remove('hidden');

    setTimeout(() => {
      if (banner.classList.contains('visible') && state.currentScreen === 'home') {
        hidePushNotification();
      }
    }, 10000);
  }

  function hidePushNotification() {
    const banner = document.getElementById('notification-banner');
    banner.classList.remove('visible');
  }

  // =========================================================================
  // APP NAVIGATION & WINDOW MANAGEMENT
  // =========================================================================
  function openApp(appId) {
    if (state.currentScreen === 'lock') return;
    SoundFx.tap();
    hidePushNotification();

    const homeScreen = document.getElementById('home-screen');
    const appWindow = document.getElementById(`app-window-${appId}`);

    if (!appWindow) return;

    document.querySelectorAll('.app-window').forEach(win => win.classList.remove('active'));

    appWindow.classList.add('active');
    state.activeApp = appId;
    state.currentScreen = 'app';

    if (appId === 'messages' && state.activeChatId) {
      openChatThread(state.activeChatId);
    }
  }

  function closeCurrentApp() {
    if (state.currentScreen !== 'app') return;
    SoundFx.tap();

    document.querySelectorAll('.app-window').forEach(win => win.classList.remove('active'));
    document.getElementById('home-screen').classList.add('active');

    document.getElementById('photo-viewer-modal').classList.add('hidden');
    document.getElementById('note-lock-overlay').classList.add('hidden');

    state.activeApp = null;
    state.currentScreen = 'home';
  }

  // =========================================================================
  // APP 1: MESSAGES APP IMPLEMENTATION
  // =========================================================================
  function setupMessagesApp() {
    renderConversationList();

    document.getElementById('thread-back-btn').addEventListener('click', () => {
      SoundFx.tap();
      document.getElementById('messages-thread-view').classList.remove('active');
      document.getElementById('messages-list-view').classList.add('active');
      state.activeChatId = null;
      renderConversationList();
    });

    const sendBtn = document.getElementById('chat-send-btn');
    const textInput = document.getElementById('chat-text-input');

    const handleSend = () => {
      const text = textInput.value.trim();
      if (!text || !state.activeChatId) return;
      textInput.value = '';
      sendUserMessage(text);
    };

    sendBtn.addEventListener('click', handleSend);
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    document.querySelectorAll('.quick-reply-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const replyText = pill.getAttribute('data-reply');
        sendUserMessage(replyText);
        pill.remove();
        if (document.querySelectorAll('.quick-reply-pill').length === 0) {
          document.getElementById('quick-replies-bar').classList.add('hidden');
        }
      });
    });

    document.getElementById('btn-call-from-chat').addEventListener('click', () => {
      SoundFx.tap();
      openApp('phone');
      switchPhoneTab('voicemail');
    });
  }

  function renderConversationList() {
    if (!state.chats) return;
    const listContainer = document.getElementById('conversation-list');
    listContainer.innerHTML = '';

    state.chats.forEach(chat => {
      const lastMsg = chat.messages[chat.messages.length - 1] || { text: '', time: '' };
      const item = document.createElement('div');
      item.className = 'conversation-item';
      item.setAttribute('data-chat-id', chat.id);

      const unreadCount = chat.initialUnread || 0;
      const unreadBadgeHtml = unreadCount > 0 ? `<span class="conv-badge">${unreadCount}</span>` : '';

      item.innerHTML = `
        <div class="conv-avatar-wrap">
          <img class="conv-avatar" src="${chat.avatar}" alt="${chat.name}">
          ${chat.online ? '<span class="online-dot"></span>' : ''}
        </div>
        <div class="conv-info">
          <div class="conv-header">
            <span class="conv-name">${chat.name}</span>
            <span class="conv-time">${lastMsg.time}</span>
          </div>
          <div class="conv-preview-row">
            <span class="conv-preview">${lastMsg.text}</span>
            ${unreadBadgeHtml}
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        chat.initialUnread = 0;
        openChatThread(chat.id);
      });

      listContainer.appendChild(item);
    });
  }

  function openChatThread(chatId) {
    if (!state.chats) return;
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    state.activeChatId = chatId;
    document.getElementById('messages-list-view').classList.remove('active');
    document.getElementById('messages-thread-view').classList.add('active');

    document.getElementById('thread-avatar-img').src = chat.avatar;
    document.getElementById('thread-contact-name').textContent = chat.name;
    document.getElementById('thread-contact-status').textContent = chat.online ? 'Active now' : chat.status;
    document.getElementById('typing-avatar').src = chat.avatar;

    const container = document.getElementById('chat-bubbles-container');
    container.innerHTML = '';

    chat.messages.forEach(msg => {
      appendMessageBubble(msg.sender, msg.text, msg.time, msg.image);
    });

    scrollChatToBottom();

    if (chat.incomingQueue && chat.incomingQueue.length > 0) {
      processIncomingQueue(chat);
    }
  }

  function appendMessageBubble(sender, text, time, image) {
    const container = document.getElementById('chat-bubbles-container');
    const isSent = sender === 'sangwon';

    const row = document.createElement('div');
    row.className = `chat-bubble-row ${isSent ? 'sent' : 'received'}`;
    
    let bubbleContent = '';
    if (image) {
      bubbleContent += `<div class="chat-photo-wrap"><img src="${image}" alt="Photo" class="chat-photo-attachment" loading="lazy"></div>`;
    }
    if (text) {
      bubbleContent += `<div class="chat-text">${escapeHtml(text)}</div>`;
    }

    row.innerHTML = `
      <div class="chat-bubble ${image ? 'chat-bubble-image' : ''}">${bubbleContent}</div>
      <span class="chat-bubble-meta">${time || 'now'}${isSent ? ' • Read' : ''}</span>
    `;

    if (image) {
      const imgElem = row.querySelector('.chat-photo-attachment');
      if (imgElem) {
        imgElem.addEventListener('click', () => {
          SoundFx.tap();
          const photoIdx = state.config?.photos?.findIndex(p => p.url === image);
          if (photoIdx !== -1 && photoIdx !== undefined) {
            openPhotoViewer(photoIdx, state.config.photos);
          }
        });
      }
    }

    container.appendChild(row);
    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    const stream = document.getElementById('chat-stream');
    stream.scrollTop = stream.scrollHeight;
  }

  function processIncomingQueue(chat) {
    if (!chat.incomingQueue || chat.incomingQueue.length === 0) return;

    const nextMsg = chat.incomingQueue.shift();
    const typingRow = document.getElementById('typing-indicator-row');

    setTimeout(() => {
      typingRow.classList.remove('hidden');
      scrollChatToBottom();

      setTimeout(() => {
        typingRow.classList.add('hidden');
        chat.messages.push(nextMsg);
        appendMessageBubble(nextMsg.sender, nextMsg.text, nextMsg.time);
        SoundFx.notification();

        if (chat.id === 'anxin') {
          document.getElementById('quick-replies-bar').classList.remove('hidden');
        }

        if (chat.incomingQueue.length > 0) {
          processIncomingQueue(chat);
        }
      }, 1600);
    }, nextMsg.delay || 1200);
  }

  function sendUserMessage(text) {
    SoundFx.tap();
    const chat = state.chats.find(c => c.id === state.activeChatId);
    if (!chat) return;

    const now = state.config?.owner?.clockTime || '23:48';
    const newMsg = {
      id: `usr_${Date.now()}`,
      sender: 'sangwon',
      text: text,
      time: now,
      status: 'read'
    };

    chat.messages.push(newMsg);
    appendMessageBubble('sangwon', text, now);

    // If talking to Anxinie, simulate an affectionate reply
    if (chat.id === 'anxin') {
      const typingRow = document.getElementById('typing-indicator-row');
      setTimeout(() => {
        typingRow.classList.remove('hidden');
        scrollChatToBottom();

        setTimeout(() => {
          typingRow.classList.add('hidden');
          const replyText = "Hurry back, hyung... I'm keeping the peach tea cold for you! Pull your coat tight, it's freezing tonight 🤍";
          const replyMsg = { id: `anxin_rep_${Date.now()}`, sender: 'anxin', text: replyText, time: now };
          chat.messages.push(replyMsg);
          appendMessageBubble('anxin', replyText, now);
          SoundFx.notification();
        }, 2000);
      }, 1000);
    }
  }

  // =========================================================================
  // APP 2: PHOTOS APP IMPLEMENTATION
  // =========================================================================
  function setupPhotosApp() {
    renderPhotosGrid();

    // Tab buttons handling (Library, Favorites, Anxinie 🤍)
    const tabBtns = document.querySelectorAll('.photos-tab');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFx.tap();
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activePhotosTab = btn.getAttribute('data-tab') || 'all';
        renderPhotosGrid();
      });
    });

    document.getElementById('btn-close-viewer').addEventListener('click', () => {
      SoundFx.tap();
      document.getElementById('photo-viewer-modal').classList.add('hidden');
    });

    document.getElementById('btn-prev-photo').addEventListener('click', () => {
      navigatePhoto(-1);
    });

    document.getElementById('btn-next-photo').addEventListener('click', () => {
      navigatePhoto(1);
    });

    // Info button toggles caption card visibility
    const infoBtn = document.getElementById('btn-share-photo');
    if (infoBtn) {
      infoBtn.addEventListener('click', () => {
        SoundFx.tap();
        const card = document.getElementById('viewer-caption-card');
        if (card) {
          card.classList.toggle('hidden-caption');
        }
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      const viewer = document.getElementById('photo-viewer-modal');
      if (viewer.classList.contains('hidden')) return;

      if (e.key === 'ArrowLeft') navigatePhoto(-1);
      if (e.key === 'ArrowRight') navigatePhoto(1);
      if (e.key === 'Escape') viewer.classList.add('hidden');
    });

    // Touch swipe support for viewer
    let touchStartX = 0;
    const viewerWrap = document.getElementById('viewer-image-wrap');
    if (viewerWrap) {
      viewerWrap.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      viewerWrap.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) navigatePhoto(-1);
          else navigatePhoto(1);
        }
      }, { passive: true });
    }
  }

  function getFilteredPhotos() {
    if (!state.config?.photos) return [];
    if (state.activePhotosTab === 'favorites') {
      return state.config.photos.filter(p => p.favorite === true);
    }
    if (state.activePhotosTab === 'anxin') {
      return state.config.photos.filter(p => 
        p.category === 'anxin' || 
        (p.title && p.title.toLowerCase().includes('anxin')) || 
        (p.caption && p.caption.toLowerCase().includes('anxin')) ||
        p.favorite
      );
    }
    return state.config.photos;
  }

  function renderPhotosGrid() {
    if (!state.config?.photos) return;
    const grid = document.getElementById('photos-grid');
    grid.innerHTML = '';

    const currentList = getFilteredPhotos();

    const countLabel = document.getElementById('photos-count-label');
    if (countLabel) {
      countLabel.textContent = `${currentList.length} Photos`;
    }

    const titleLabel = document.getElementById('photos-section-title');
    if (titleLabel) {
      if (state.activePhotosTab === 'favorites') {
        titleLabel.textContent = 'Favorite Moments';
      } else if (state.activePhotosTab === 'anxin') {
        titleLabel.textContent = 'With Anxinie 🤍';
      } else {
        titleLabel.textContent = 'Memories & Moments';
      }
    }

    currentList.forEach((photo, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumb-item';
      thumb.innerHTML = `<img src="${photo.thumb || photo.url}" alt="${escapeHtml(photo.title)}" loading="lazy">`;

      thumb.addEventListener('click', () => {
        SoundFx.tap();
        openPhotoViewer(idx, currentList);
      });

      grid.appendChild(thumb);
    });
  }

  function openPhotoViewer(idx, list) {
    const photosList = list || state.currentViewerList || getFilteredPhotos();
    state.currentViewerIndex = idx;
    state.currentViewerList = photosList;
    const photo = photosList[idx];
    if (!photo) return;

    document.getElementById('viewer-img').src = photo.url;
    document.getElementById('viewer-counter').textContent = `${idx + 1} of ${photosList.length}`;
    const hasInfo = Boolean(photo.title || photo.date || photo.location || photo.caption);
    const card = document.getElementById('viewer-caption-card');
    const infoBtn = document.getElementById('btn-share-photo');

    if (card) {
      if (hasInfo) {
        document.getElementById('viewer-title').textContent = photo.title || '';
        document.getElementById('viewer-date').textContent = photo.date || '';
        document.getElementById('viewer-location').textContent = photo.location ? `📍 ${photo.location}` : '';
        const captionEl = document.getElementById('viewer-caption-text');
        if (captionEl) {
          captionEl.textContent = photo.caption || '';
          captionEl.style.display = photo.caption ? '' : 'none';
        }
        card.style.display = '';
        card.classList.remove('hidden-caption');
      } else {
        card.style.display = 'none';
      }
    }

    if (infoBtn) {
      infoBtn.style.display = hasInfo ? '' : 'none';
    }

    document.getElementById('photo-viewer-modal').classList.remove('hidden');
  }

  function navigatePhoto(direction) {
    SoundFx.tap();
    const photosList = state.currentViewerList || getFilteredPhotos();
    const total = photosList.length;
    if (total === 0) return;
    let nextIdx = state.currentViewerIndex + direction;
    if (nextIdx < 0) nextIdx = total - 1;
    if (nextIdx >= total) nextIdx = 0;
    openPhotoViewer(nextIdx, photosList);
  }

  // =========================================================================
  // APP 3: NOTES APP & LOCKED NOTE PIN LOGIC
  // =========================================================================
  function setupNotesApp() {
    renderNotesList();

    document.getElementById('notes-back-btn').addEventListener('click', () => {
      SoundFx.tap();
      document.getElementById('notes-detail-view').classList.remove('active');
      document.getElementById('notes-list-view').classList.add('active');
      state.activeNoteId = null;
    });

    document.querySelectorAll('.nkey[data-k]').forEach(btn => {
      btn.addEventListener('click', () => {
        handleNotePinInput(btn.getAttribute('data-k'));
      });
    });

    document.getElementById('btn-note-del').addEventListener('click', () => {
      if (state.notePinBuffer.length > 0) {
        SoundFx.tap();
        state.notePinBuffer = state.notePinBuffer.slice(0, -1);
        updateNotePinDots();
      }
    });

    document.getElementById('btn-note-hint').addEventListener('click', () => {
      SoundFx.tap();
      const hintLabel = document.getElementById('note-hint-label');
      hintLabel.classList.toggle('hidden');
    });

    document.getElementById('btn-cancel-note-unlock').addEventListener('click', () => {
      SoundFx.tap();
      document.getElementById('note-lock-overlay').classList.add('hidden');
      state.notePinBuffer = '';
      updateNotePinDots();
    });
  }

  function renderNotesList() {
    if (!state.config?.notes) return;
    const list = document.getElementById('notes-list');
    list.innerHTML = '';
    document.getElementById('notes-total-count').textContent = `${state.config.notes.length} Notes`;

    state.config.notes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-card-item';
      card.innerHTML = `
        <div class="note-card-header">
          <span class="note-card-title">${note.title}</span>
          ${note.locked ? '<span class="note-card-lock-badge">🔒</span>' : ''}
        </div>
        <div class="note-card-meta">
          <span class="note-card-date">${note.date}</span>
          <span class="note-card-snippet">${note.snippet}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        SoundFx.tap();
        if (note.locked) {
          promptLockedNote(note);
        } else {
          openNoteReader(note);
        }
      });

      list.appendChild(card);
    });
  }

  function openNoteReader(note) {
    state.activeNoteId = note.id;
    document.getElementById('notes-list-view').classList.remove('active');
    document.getElementById('notes-detail-view').classList.add('active');

    document.getElementById('note-reader-date').textContent = note.date;
    document.getElementById('note-reader-title').textContent = note.title;
    document.getElementById('note-reader-body').textContent = note.content;
    document.getElementById('note-reader-lock-tag').textContent = note.locked ? '🔓 Decrypted' : '';
  }

  function promptLockedNote(note) {
    state.activeNoteId = note.id;
    state.notePinBuffer = '';
    updateNotePinDots();
    document.getElementById('note-hint-label').classList.add('hidden');
    document.getElementById('note-lock-overlay').classList.remove('hidden');
  }

  function handleNotePinInput(digit) {
    if (state.notePinBuffer.length >= 4) return;
    SoundFx.tap();
    state.notePinBuffer += digit;
    updateNotePinDots();

    if (state.notePinBuffer.length === 4) {
      setTimeout(verifyNotePin, 150);
    }
  }

  function updateNotePinDots() {
    const dots = document.querySelectorAll('#note-pin-dots .np-dot');
    dots.forEach((dot, idx) => {
      if (idx < state.notePinBuffer.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  function verifyNotePin() {
    const note = state.config.notes.find(n => n.id === state.activeNoteId);
    if (!note) return;

    if (state.notePinBuffer === (note.pin || '1204')) {
      SoundFx.unlock();
      document.getElementById('note-lock-overlay').classList.add('hidden');
      openNoteReader(note);
    } else {
      SoundFx.error();
      const dots = document.getElementById('note-pin-dots');
      dots.classList.add('shake');
      setTimeout(() => {
        dots.classList.remove('shake');
        state.notePinBuffer = '';
        updateNotePinDots();
      }, 500);
    }
  }

  // =========================================================================
  // APP 4: PHONE APP IMPLEMENTATION
  // =========================================================================
  function setupPhoneApp() {
    document.querySelectorAll('.phone-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFx.tap();
        const tab = btn.getAttribute('data-tab');
        switchPhoneTab(tab);
      });
    });

    renderPhoneRecents();
    renderPhoneContacts();

    let dialDisplay = '';
    const displayEl = document.getElementById('dialer-display');
    document.querySelectorAll('.dial-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        SoundFx.dial(val);
        dialDisplay += val;
        displayEl.textContent = dialDisplay;
      });
    });

    document.getElementById('btn-dialer-call').addEventListener('click', () => {
      if (!dialDisplay) return;
      SoundFx.unlock();
      alert(`Calling ${dialDisplay}...\n[Call connecting to ALD1 Dorm Private Line]`);
      dialDisplay = '';
      displayEl.innerHTML = '&nbsp;';
    });

    const playBtn = document.getElementById('btn-play-voicemail');
    const waveform = document.getElementById('vm-waveform');

    playBtn.addEventListener('click', () => {
      state.isVoicemailPlaying = !state.isVoicemailPlaying;
      if (state.isVoicemailPlaying) {
        SoundFx.notification();
        playBtn.textContent = '⏸';
        waveform.classList.add('playing');
        setTimeout(() => {
          state.isVoicemailPlaying = false;
          playBtn.textContent = '▶';
          waveform.classList.remove('playing');
        }, 8000);
      } else {
        playBtn.textContent = '▶';
        waveform.classList.remove('playing');
      }
    });
  }

  function switchPhoneTab(tabName) {
    document.querySelectorAll('.phone-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.phone-tab-content').forEach(c => c.classList.remove('active'));

    const targetBtn = document.querySelector(`.phone-tab-btn[data-tab="${tabName}"]`);
    const targetContent = document.getElementById(`phone-tab-${tabName}`);

    if (targetBtn) targetBtn.classList.add('active');
    if (targetContent) targetContent.classList.add('active');

    const titles = { recents: 'Recents', contacts: 'Contacts', keypad: 'Keypad', voicemail: 'Voicemail' };
    document.getElementById('phone-nav-title').textContent = titles[tabName] || 'Phone';
  }

  function renderPhoneRecents() {
    if (!state.config?.callHistory) return;
    const list = document.getElementById('recents-list');
    list.innerHTML = '';

    state.config.callHistory.forEach(call => {
      const item = document.createElement('div');
      item.className = 'call-item';
      const isMissed = call.type === 'missed';
      item.innerHTML = `
        <div class="call-info-left">
          <span class="call-name ${isMissed ? 'missed' : ''}">${call.name} ${call.count ? `(${call.count})` : ''}</span>
          <span class="call-sub">${call.phone || 'Cellular'}</span>
        </div>
        <div class="call-meta-right">
          <span>${call.time}</span>
          <span class="info-icon-btn">ⓘ</span>
        </div>
      `;
      list.appendChild(item);
    });
  }

  function renderPhoneContacts() {
    if (!state.config?.contacts) return;
    const list = document.getElementById('contacts-list');
    list.innerHTML = '';

    state.config.contacts.forEach(contact => {
      const item = document.createElement('div');
      item.className = 'conversation-item';
      item.innerHTML = `
        <div class="conv-avatar-wrap">
          <img class="conv-avatar" src="${contact.avatar}" alt="${contact.name}">
        </div>
        <div class="conv-info">
          <div class="conv-name">${contact.name}</div>
          <div class="conv-preview">${contact.phone} • ${contact.relation}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        SoundFx.tap();
        openApp('messages');
        openChatThread(contact.id);
      });
      list.appendChild(item);
    });
  }

  // =========================================================================
  // GLOBAL EVENT LISTENERS & HARDWARE BUTTONS
  // =========================================================================
  function setupEventListeners() {
    // 1. Lock Screen Keypad
    document.querySelectorAll('#lock-keypad .keypad-btn[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        handleLockKeypress(btn.getAttribute('data-key'));
      });
    });

    document.getElementById('btn-keypad-delete').addEventListener('click', handleLockDelete);

    const autofillPin = () => {
      SoundFx.tap();
      const targetPin = (state.config && state.config.owner && state.config.owner.pin) || '0520';
      state.lockPinBuffer = targetPin;
      updatePinDots();
      setTimeout(verifyLockPin, 150);
    };

    document.getElementById('btn-keypad-hint').addEventListener('click', autofillPin);
    document.getElementById('pin-hint-box').addEventListener('click', autofillPin);

    // 2. App Icons on Home Screen
    document.querySelectorAll('.app-icon-item, .dock-icon-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.getAttribute('data-app');
        if (appId) openApp(appId);
      });
    });

    // 3. Notification Banner Click -> Opens Anxin's Chat
    document.getElementById('notification-banner').addEventListener('click', () => {
      SoundFx.tap();
      hidePushNotification();
      openApp('messages');
      const targetChatId = (state.config.notification && state.config.notification.targetChatId) || 'anxin';
      openChatThread(targetChatId);
    });

    // 4. Global Home Indicator (Swipe-Up Bar)
    const homeZone = document.getElementById('home-indicator-zone');
    homeZone.addEventListener('click', () => {
      closeCurrentApp();
    });

    let touchStartY = 0;
    homeZone.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    homeZone.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchStartY - touchEndY > 20) {
        closeCurrentApp();
      }
    }, { passive: true });

    // 5. Hardware & Desktop Buttons
    document.getElementById('hardware-power-btn').addEventListener('click', () => {
      if (state.currentScreen === 'lock') {
        SoundFx.tap();
      } else {
        lockPhone();
      }
    });

    document.getElementById('btn-desktop-lock').addEventListener('click', lockPhone);
    document.getElementById('btn-quick-lock-phone').addEventListener('click', lockPhone);

    document.getElementById('btn-desktop-hint').addEventListener('click', () => {
      if (state.currentScreen !== 'lock') lockPhone();
      setTimeout(() => {
        autofillPin();
      }, 300);
    });

    document.getElementById('btn-reset-story').addEventListener('click', () => {
      SoundFx.tap();
      location.reload();
    });

    const soundBtn = document.getElementById('btn-desktop-sound');
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundBtn.textContent = `Sound: ${state.soundEnabled ? 'ON' : 'OFF'}`;
      if (state.soundEnabled) SoundFx.tap();
    });

    const island = document.getElementById('dynamic-island');
    island.addEventListener('click', () => {
      SoundFx.tap();
      island.classList.toggle('expanded');
      const text = document.getElementById('island-text');
      if (island.classList.contains('expanded')) {
        text.textContent = 'Playing: Our Secret Frequency (02:14)';
        setTimeout(() => island.classList.remove('expanded'), 4000);
      } else {
        text.textContent = 'ALD1 Duo';
      }
    });

    window.addEventListener('keydown', (e) => {
      if (state.currentScreen === 'lock') {
        if (e.key >= '0' && e.key <= '9') {
          handleLockKeypress(e.key);
        } else if (e.key === 'Backspace') {
          handleLockDelete();
        }
      }
    });
  }

  // =========================================================================
  // UTILITIES
  // =========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('SW registration skipped:', err);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
