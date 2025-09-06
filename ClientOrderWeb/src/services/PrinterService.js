import { DEVICE_CODE } from '../config/appConfig.js'


export function printReceipt(ip, port, deviceId, receipt) {
    return new Promise((resolve, reject) => {
        try {
            if (!window.epson || !window.epson.ePOSDevice) {
                console.log('Epson ePOSDevice SDK not loaded');
                return reject(new Error('Epson ePOSDevice SDK not loaded'));
            }
            console.log('Epson ePOSDevice SDK loaded');
            const ePosDev = new epson.ePOSDevice();
            const numericPort = typeof port === 'number' ? port : Number(port) || 8008;
            const connectOpts = { eposprint: false }; // force WS mode, avoid HTTP Display probe
            const timeoutMs = 20000; // hard timeout to avoid long wait
            const abort = (err) => {
                try { ePosDev.disconnect(); } catch (_) { }
                return reject(err instanceof Error ? err : new Error(String(err || 'Print aborted')));
            };
            const timerId = setTimeout(() => abort(new Error('Print timeout')), timeoutMs);

            // Global device error -> fail fast
            ePosDev.onerror = function (_sq, _deviceId, code) {
                clearTimeout(timerId);
                abort(new Error(code || 'DEVICE_ERROR'));
            };

            ePosDev.connect(ip, numericPort, function (connectState) {
                if (connectState !== 'OK' && connectState !== 'SSL_CONNECT_OK') {
                    clearTimeout(timerId);
                    console.error('Connect failed:', connectState);
                    return abort(new Error('Connect failed: ' + connectState));
                }

                ePosDev.createDevice(deviceId, ePosDev.DEVICE_TYPE_PRINTER, {}, function (deviceObj, ret) {
                    if (!deviceObj) {
                        clearTimeout(timerId);
                        console.error('createDevice failed:', ret);
                        return abort(new Error('createDevice failed: ' + ret));
                    }

                    // Một số model hybrid: deviceObj.ReceiptPrinter
                    const printer = deviceObj.ReceiptPrinter ? deviceObj.ReceiptPrinter : deviceObj;

                    printer.onreceive = function (res) {
                        clearTimeout(timerId);
                        try { ePosDev.disconnect(); } catch (_) { }
                        if (res && (res.success === true || res.success === 'true')) return resolve(res);
                        return reject(res || new Error('Print failed'));
                    };

                    try {
                        // Sử dụng nội dung từ createReceiptContent để in
                        const content = createReceiptContent(receipt);
                        printer.addTextLang('en');
                        printer.addTextAlign(printer.ALIGN_LEFT);
                        printer.addText(content + '\n');
                        printer.addFeedLine(2);
                        printer.addCut(printer.CUT_FEED);

                        // Gửi lệnh in
                        if (deviceObj.ReceiptPrinter) deviceObj.ReceiptPrinter.send();
                        else deviceObj.send();
                    } catch (err) {
                        clearTimeout(timerId);
                        return abort(err);
                    }
                });
            }, connectOpts);
        } catch (err) {
            return reject(err);
        }
    });
}


export function createReceiptContent(receipt) {
    const toVnd = (n) => Number(n || 0).toLocaleString('vi-VN');
    const dwMap = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const paidAt = receipt?.paidAt ? new Date(receipt.paidAt) : (receipt?.createdAt ? new Date(receipt.createdAt) : new Date());
    const dow = dwMap[paidAt.getDay()];
    const hh = String(paidAt.getHours()).padStart(2, '0');
    const mm = String(paidAt.getMinutes()).padStart(2, '0');
    const ss = String(paidAt.getSeconds()).padStart(2, '0');
    const d = paidAt.getDate();
    const m = paidAt.getMonth() + 1;
    const y = paidAt.getFullYear();
    const fmtDate = `${dow} ${hh}:${mm}:${ss} ${d}/${m}/${y}`;

    const pmMap = { cash: 'Tiền mặt', card: 'Thẻ', ewallet: 'Ví điện tử' };
    const pm = pmMap[receipt?.paymentMethod] || receipt?.paymentMethod || '';

    const LINE_WIDTH = 35; // số ký tự cho một dòng nội dung + canh phải số tiền
    const SEP = '-'.repeat(LINE_WIDTH);

    const padLine = (left, right) => {
        const l = String(left || '').trim();
        const r = String(right || '').trim();
        const maxLeft = Math.max(0, LINE_WIDTH - r.length - 1);
        const leftCut = l.length > maxLeft ? l.slice(0, maxLeft) : l;
        const spaces = Math.max(1, LINE_WIDTH - leftCut.length - r.length);
        return `${leftCut}${' '.repeat(spaces)}${r}`;
    };

    const lines = [];
    lines.push('           Biên lai');
    lines.push('');
    lines.push(`Số BL: ${receipt?.receiptNumber || receipt?.id || ''}`);
    lines.push(`Mã đơn: ${receipt?.orderNumber || receipt?.orderId || ''}`);
    lines.push(`Ngày: ${fmtDate}`);
    lines.push(`Phương thức: ${pm}`);
    lines.push(`Nhân viên: ${DEVICE_CODE || ''}`);
    lines.push(SEP);
    lines.push('Tên sản phẩm                Đơn giá');

    const items = Array.isArray(receipt?.items) ? receipt.items : [];
    items.forEach((it) => {
        const name = String(it?.itemName || '').trim();
        const qty = Number(it?.qty || 0);
        const unit = Number(it?.unitPrice || 0);
        for (let i = 0; i < qty; i++) {
            lines.push(padLine(name, toVnd(unit)));
        }
    });

    lines.push(SEP);
    const total = (receipt?.finalAmount != null)
        ? Number(receipt.finalAmount)
        : ((receipt?.totalAmount != null) ? Number(receipt.totalAmount) : items.reduce((s, it) => s + Number(it?.totalPrice || 0), 0));
    lines.push(padLine('Tổng tiền', toVnd(total)));
    lines.push('(đã bao gồm 10% thuế)');

    return lines.join('\n');
}