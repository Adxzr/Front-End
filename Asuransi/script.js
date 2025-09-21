// 🔑 Hash password pakai SHA-256
async function hashPassword(password){
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b=>b.toString(16).padStart(2,'0'))
    .join('');
}

// 🔍 Validasi utilitas
function isValidEmail(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);}
function hasNumber(str){return /\d/.test(str);}
function isOnlyDigits(str){return /^\d+$/.test(str);}
function isValidPhone(phone){return /^08\d{8,14}$/.test(phone);}

// 📦 User storage
function getUsers(){try{return JSON.parse(localStorage.getItem('users')||'[]');}catch{return[];}}
function saveUsers(users){localStorage.setItem('users',JSON.stringify(users));}

// 🌱 Seed demo user
(async function seedDemo(){
  const users = getUsers();
  if(users.length===0){
    users.push({
      email:'demo@example.com',
      password:await hashPassword('Password123'),
      fullname:'Demo User',
      phone:'081234567890'
    });
    saveUsers(users);
  }
})();

// 👁 Toggle show/hide password
document.querySelectorAll('.toggle-password').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const target=document.getElementById(btn.dataset.target);
    if(target.type==='password'){
      target.type='text';
      btn.textContent='🙈';
    } else {
      target.type='password';
      btn.textContent='👁';
    }
  });
});

// 🔐 LOGIN
const loginForm=document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=document.getElementById('loginEmail').value.trim();
    const password=document.getElementById('loginPassword').value;
    document.getElementById('loginEmailError').textContent='';
    document.getElementById('loginPasswordError').textContent='';
    const msg=document.getElementById('loginMessage');
    msg.style.display='none';msg.textContent='';msg.className='message';

    let ok=true;
    if(!email){document.getElementById('loginEmailError').textContent='Email harus diisi.';ok=false;}
    else if(!isValidEmail(email)){document.getElementById('loginEmailError').textContent='Format email tidak valid.';ok=false;}
    if(!password){document.getElementById('loginPasswordError').textContent='Kata sandi harus diisi.';ok=false;}
    if(!ok)return;

    const users=getUsers();
    const hash=await hashPassword(password);
    const user=users.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===hash);

    if(!user){
      msg.textContent='Email atau kata sandi salah.';
      msg.classList.add('error');
      msg.style.display='block';

      // efek shake
      loginForm.classList.remove('shake');
      void loginForm.offsetWidth;
      loginForm.classList.add('shake');
    } else {
      msg.textContent='Login berhasil. Mengalihkan...';
      msg.classList.add('success');
      msg.style.display='block';
      loginForm.classList.remove('shake');

      localStorage.setItem('currentUser',JSON.stringify(user));
      setTimeout(()=>{window.location.href='home.html';},1000);
    }
  });
}

// 📝 SIGNUP
const signupForm=document.getElementById('signupForm');
if(signupForm){
  signupForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=document.getElementById('signupEmail').value.trim();
    const password=document.getElementById('signupPassword').value;
    const confirm=document.getElementById('signupConfirm').value;
    const fullname=document.getElementById('fullName').value.trim();
    const phone=document.getElementById('phone').value.trim();

    ['signupEmailError','signupPasswordError','signupConfirmError','fullNameError','phoneError']
      .forEach(id=>document.getElementById(id).textContent='');

    const msg=document.getElementById('signupMessage');
    msg.style.display='none';msg.textContent='';msg.className='message';

    let ok=true;
    if(!email){document.getElementById('signupEmailError').textContent='Email harus diisi.';ok=false;}
    else if(!isValidEmail(email)){document.getElementById('signupEmailError').textContent='Format email tidak valid.';ok=false;}

    if(!password){document.getElementById('signupPasswordError').textContent='Kata sandi harus diisi.';ok=false;}
    else if(password.length<8){document.getElementById('signupPasswordError').textContent='Minimal 8 karakter.';ok=false;}

    if(!confirm){document.getElementById('signupConfirmError').textContent='Konfirmasi harus diisi.';ok=false;}
    else if(password!==confirm){document.getElementById('signupConfirmError').textContent='Tidak sesuai.';ok=false;}

    if(!fullname){document.getElementById('fullNameError').textContent='Nama harus diisi.';ok=false;}
    else if(fullname.length<3||fullname.length>32){document.getElementById('fullNameError').textContent='3-32 karakter.';ok=false;}
    else if(hasNumber(fullname)){document.getElementById('fullNameError').textContent='Tidak boleh ada angka.';ok=false;}

    if(!phone){document.getElementById('phoneError').textContent='Nomor harus diisi.';ok=false;}
    else if(!isOnlyDigits(phone)){document.getElementById('phoneError').textContent='Hanya angka.';ok=false;}
    else if(!isValidPhone(phone)){document.getElementById('phoneError').textContent='Harus diawali 08 dan 10-16 digit.';ok=false;}

    if(!ok)return;

    const users=getUsers();
    if(users.find(u=>u.email.toLowerCase()===email.toLowerCase())){
      msg.textContent='Email sudah terdaftar.';
      msg.classList.add('error');
      msg.style.display='block';
      return;
    }

    const hash=await hashPassword(password);
    users.push({email,password:hash,fullname,phone});
    saveUsers(users);

    msg.textContent='Pendaftaran berhasil!';
    msg.classList.add('success');
    msg.style.display='block';

    setTimeout(()=>{window.location.href='index.html';},1200);
  });
}
