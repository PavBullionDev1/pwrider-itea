export interface Httprequest {
    status: string;
    result: {
        token: string,
        user_id: string,
        name: string,
        email: string,
        phone: string,
        email_verified: string,
        phone_verified: string,
        avatar: string,
        join_date: string,
        qrCode: string,

    };
}
