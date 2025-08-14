# toDoList

# 📋 Görev Takibi - PWA

Modern ve kullanıcı dostu görev takip uygulaması. PWA (Progressive Web App) olarak çalışır ve mobil cihazlarda ana ekrana eklenebilir.

## ✨ Özellikler

- 📱 **PWA Desteği** - Ana ekrana eklenebilir
- 🔔 **Akıllı Alarm Sistemi** - Otomatik hatırlatıcılar
- 📅 **Son Teslim Tarihi Takibi** - 1 gün ve 1 saat önce uyarı
- 🎯 **Proje Kategorileri** - Web sitesi, e-ticaret, blog vb.
- ⚡ **Öncelik Sistemi** - Yüksek, Orta, Düşük
- 💰 **Fiyat Takibi** - Müşteri projeleri için
- 📝 **Yapılacaklar Listesi** - Her proje için detaylı görevler
- 🔄 **Offline Çalışma** - İnternet olmadan da kullanılabilir
- 🌙 **Modern UI/UX** - Responsive tasarım

## 🚀 Kurulum

### Yerel Geliştirme
```bash
# Repository'yi klonlayın
git clone [repository-url]

# Proje dizinine gidin
cd toDoList

# HTTP server başlatın
python -m http.server 8000

# Tarayıcıda açın
http://localhost:8000
```

### PWA Olarak Yükleme
1. Tarayıcıda sayfayı açın
2. Sağ üstteki "📱 Ana Ekrana Ekle" butonuna tıklayın
3. PWA'yı ana ekrana ekleyin

## 📱 PWA Özellikleri

- **Ana Ekrana Ekleme** - Gerçek uygulama gibi
- **Offline Çalışma** - Service Worker ile
- **Push Bildirimleri** - Alarm ve hatırlatıcılar için
- **Responsive Tasarım** - Tüm cihazlarda mükemmel

## 🔔 Alarm Sistemi

### Otomatik Hatırlatıcılar
- **1 Gün Önce** - Son teslim tarihinden 24 saat önce
- **1 Saat Önce** - Son teslim tarihinden 60 dakika önce
- **Son Teslim Tarihi** - Tarih geçtiğinde

### Manuel Alarm
- Kullanıcı tarafından belirlenen özel zaman
- Ses, bildirim ve titreşim ile uyarı

## 🛠️ Teknolojiler

- **HTML5** - Semantic markup
- **CSS3** - Modern styling ve animations
- **JavaScript (ES6+)** - Modern JavaScript özellikleri
- **Service Worker** - Offline çalışma ve cache
- **PWA API** - Install, notifications, cache
- **LocalStorage** - Veri saklama

## 📁 Proje Yapısı

```
toDoList/
├── index.html          # Ana HTML dosyası
├── style.css           # CSS stilleri
├── script.js           # JavaScript kodu
├── service-worker.js   # Service Worker
├── manifest.json       # PWA manifest
├── toDoList.jpg        # Arka plan resmi
├── to-do-list 128.png  # PWA ikonu (128x128)
├── to-do-list 512.png  # PWA ikonu (512x512)
└── README.md           # Bu dosya
```

## 🌐 Tarayıcı Desteği

- ✅ **Chrome** - Tam destek
- ✅ **Firefox** - Tam destek
- ✅ **Safari** - Tam destek (iOS 11.3+)
- ✅ **Edge** - Tam destek

## 📱 Mobil Uyumluluk

- **Android** - Chrome, Firefox, Samsung Internet
- **iOS** - Safari (iOS 11.3+)
- **Responsive** - Tüm ekran boyutları

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. Feature branch oluşturun
2. Geliştirmeyi yapın
3. Test edin
4. Pull request gönderin

### Debug
- Console'da detaylı loglar
- Service Worker durumu
- PWA install durumu

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.

---

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**
