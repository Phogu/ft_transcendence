# 🕹 ft_transcendence

**ft_transcendence**, Ecole 42 bünyesinde geliştirilen, kullanıcıların giriş yapabildiği, arkadaş ekleyebildiği, sohbet edebildiği ve gerçek zamanlı Pong oyunu oynayabildiği tam kapsamlı bir web uygulamasıdır.

## 📌 Proje Amacı

Bu proje, modern web teknolojilerini kullanarak bir **Single Page Application (SPA)** geliştirme yetkinliği kazandırmayı amaçlar.
Backend, frontend, kullanıcı kimlik doğrulama, gerçek zamanlı etkileşim gibi konularda kapsamlı deneyim sağlar.

---

## 🚀 Kullanılan Teknolojiler

### 🧠 Backend
- **NestJS** (Node.js framework)
- **TypeScript**
- **PostgreSQL** (Veritabanı)
- **TypeORM**
- **JWT** (Authentication & Authorization)
- **WebSocket** (Gerçek zamanlı oyun ve sohbet için)
- **2FA (Two-Factor Authentication)** desteği

### 🎨 Frontend
- **React** (SPA mimarisi)
- **TypeScript**
- **SASS / CSS Modules**
- **Axios**
- **Socket.IO-client**
- **React-Router** (Sayfa yönlendirmeleri için)

### ⚙️ DevOps
- **Docker & Docker Compose**
- **Nginx (reverse proxy)**
- **.env ile yapılandırılabilir ortam değişkenleri**
- **CI/CD altyapısına hazır**

---

## 🔐 Özellikler

- 💬 **Gerçek Zamanlı Sohbet**  
  Birebir veya grup sohbeti desteği, çevrim içi kullanıcı takibi.

- 🎮 **Pong Oyunu (Multiplayer)**  
  Gerçek zamanlı, WebSocket üzerinden oynanabilir 3D Pong oyunu.

- 👥 **Arkadaşlık Sistemi**  
  Kullanıcılar birbirini arkadaş olarak ekleyebilir ve arkadaş listelerini görüntüleyebilir.

- 🔔 **Gerçek Zamanlı Bildirimler**  
  Davetler, arkadaşlık istekleri ve maç teklifleri anlık bildirim olarak sunulur.

- 📈 **Kullanıcı Profili ve Skorlar**  
  Her kullanıcı için özelleştirilmiş profil sayfası ve geçmiş maç verileri.

---

## 🛠 Kurulum ve Başlatma

### Gereksinimler
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Çalıştırmak için:

```bash
git clone https://github.com/Phogu/ft_transcendence.git
cd ft_transcendence
cp .env.example .env   # Ortam değişkenlerini düzenleyin
docker-compose up --build
```

### Kullanım

- Uygulama `http://localhost` adresinde çalışacaktır.
- İlk kez giriş yaparken kayıt olmanız gerekir.

---

## 🧪 Testler

- Oturum açma, arkadaşlık, oyun entegrasyonu ve sohbet modülü manuel ve otomasyon testleriyle denetlenmiştir.
- Detaylı test planı yakında paylaşılacaktır.

---

## 📚 Öğrenilenler

Bu proje sayesinde aşağıdaki konularda ileri seviye bilgi edinilmiştir:

- WebSocket ile gerçek zamanlı sistem tasarımı
- Frontend/Backend ayrımıyla SPA geliştirme
- Docker kullanarak proje konteynerizasyonu
- OAuth & 2FA ile güvenlik
- TypeScript & NestJS mimarisi

---

## 👨‍💻 Geliştirici

**Mustafa Büyükatçeken**  
📧 mustafa.buyukatceken@hotmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/mustafabuyukatceken/)  
🔗 [GitHub](https://github.com/Phogu)

---
