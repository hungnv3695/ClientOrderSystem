# Cấu trúc thư mục dự án


```
ClientOrderWeb/
├── README.md
├── Dockerfile
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── vite.svg
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── style.css
│   ├── assets/
│   │   ├── banh-mi.jpg
│   │   ├── ca-phe-den.jpg
│   │   ├── ca-phe-sua-da.jpg
│   │   ├── nuoc-sau.jpg
│   │   ├── payment-qr.jpg
│   │   └── vue.svg
│   ├── components/
│   │   ├── FoodCard.vue
│   │   ├── HelloWorld.vue
│   │   ├── OrderList.vue
│   │   └── PaymentModal.vue
│   ├── composables/
│   ├── layouts/
│   ├── router/
│   │   └── index.js
│   ├── services/
│   ├── store/
│   ├── utils/
│   └── views/
│       └── ClientOrderView.vue
└── ...
```

## Mô tả


- **src/**: Mã nguồn chính của ứng dụng Vue.
    - **App.vue, main.js, style.css**: File khởi tạo và cấu hình ứng dụng.
    - **assets/**: Hình ảnh, icon, style tĩnh.
    - **components/**: Các component giao diện (FoodCard, OrderList, PaymentModal,...).
    - **composables/**: Các hàm logic dùng lại (nếu có).
    - **layouts/**: Bố cục giao diện (nếu có).
    - **router/**: Cấu hình router (index.js).
    - **services/**: Xử lý API, logic kết nối backend.
    - **store/**: Quản lý trạng thái (nếu dùng pinia/vuex).
    - **utils/**: Tiện ích dùng chung.
    - **views/**: Các trang chính (ClientOrderView.vue,...).
- **public/**: Tài nguyên tĩnh, favicon, vite.svg.
- **index.html**: File HTML gốc.
- **package.json**: Thông tin cấu hình, dependencies.
- **vite.config.js**: Cấu hình Vite.
- **Dockerfile**: Cấu hình build Docker frontend.
- **README.md**: Tài liệu hướng dẫn dự án.

> Cấu trúc có thể thay đổi tùy theo tiến độ phát triển.
