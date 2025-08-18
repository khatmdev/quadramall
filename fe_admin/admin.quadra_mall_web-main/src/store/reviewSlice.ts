import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Review {
    id: number;
    productId: number;
    reviewerName: string;
    rating: number;
    text: string;
    date: string;
    image?: string;
    reply?: string;
    isNew?: boolean;
}

interface Product {
    id: number;
    name: string;
    avgRating: number;
    reviewCount: number;
    image: string;
}

interface Notification {
    id: string;
    type: 'new_review';
    message: string;
    timestamp: string;
    read: boolean;
    reviewId?: number;
    productId?: number;
}

interface ReviewState {
    products: Product[];
    reviews: Review[];
    notifications: Notification[];
    loading: boolean;
    error: string | null;
}

const initialState: ReviewState = {
    products: [
        { id: 1, name: 'Áo thun nam', avgRating: 4.2, reviewCount: 15, image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749548636/de3ba7de95649286c8d823bab32b20b3.jpg_720x720q80_xhebkg.jpg' },
        { id: 2, name: 'Quần jeans nữ', avgRating: 3.8, reviewCount: 10, image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749548363/969c0da2e3e71c95dfc1a8e062d6eb48_qfg1lv.jpg' },
        { id: 3, name: 'Giày thể thao', avgRating: 4.5, reviewCount: 23, image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749548526/02a821eb-9f98-4408-bd7c-9f12c1c026c1-1731320460361_s0frmx.jpg' },
        { id: 4, name: 'Túi xách nữ', avgRating: 4.0, reviewCount: 8, image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1744826424/products/1744826421955_tui-xach-nu-hang-hieu-4.jpeg.jpg' },
        { id: 5, name: 'Đồng hồ nam', avgRating: 3.9, reviewCount: 12, image: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749548578/xc1.jpg_elov3w.webp' },
    ],
    reviews: [
        { id: 1, productId: 1, reviewerName: 'Nguyen Van A', rating: 5, text: 'Sản phẩm đẹp, chất lượng tốt!', date: '2025-06-01', image: '/api/placeholder/100/100' },
        { id: 2, productId: 1, reviewerName: 'Tran Thi B', rating: 4, text: 'Chất lượng tốt, giao hàng nhanh.', date: '2025-06-02' },
        { id: 3, productId: 2, reviewerName: 'Le Van C', rating: 3, text: 'Bình thường, không có gì đặc biệt.', date: '2025-06-03' },
        { id: 4, productId: 1, reviewerName: 'Pham Thi D', rating: 5, text: 'Rất hài lòng với sản phẩm!', date: '2025-06-04', reply: 'Cảm ơn bạn đã tin tưởng sản phẩm của chúng tôi!' },
        { id: 5, productId: 3, reviewerName: 'Hoang Van E', rating: 4, text: 'Giày đẹp, êm chân.', date: '2025-06-05' },
        { id: 6, productId: 3, reviewerName: 'Nguyen Thi F', rating: 5, text: 'Chất lượng tuyệt vời!', date: '2025-06-06' },
        { id: 7, productId: 2, reviewerName: 'Tran Van G', rating: 2, text: 'Không như mong đợi.', date: '2025-06-07' },
        { id: 8, productId: 4, reviewerName: 'Le Thi H', rating: 4, text: 'Túi đẹp, giá hợp lý.', date: '2025-06-08' },
        { id: 9, productId: 5, reviewerName: 'Vu Van I', rating: 3, text: 'Đồng hồ ổn, pin hơi yếu.', date: '2025-06-09' },
        { id: 10, productId: 1, reviewerName: 'Do Thi J', rating: 1, text: 'Sản phẩm không giống hình.', date: '2025-06-10', isNew: true },
    ],
    notifications: [
        {
            id: 'notif_1',
            type: 'new_review',
            message: 'Có đánh giá mới cho sản phẩm "Áo thun nam"',
            timestamp: '2025-06-10T10:30:00Z',
            read: false,
            reviewId: 10,
            productId: 1,
        },
    ],
    loading: false,
    error: null,
};

interface AddReviewReplyPayload {
    id: number;
    reply: string;
}

interface AddNewReviewPayload {
    productId: number;
    reviewerName: string;
    rating: number;
    text: string;
    image?: string;
}

export const addReviewReply = createAsyncThunk<
    AddReviewReplyPayload,
    { id: number; reply: string },
    { rejectValue: string }
>('reviews/addReviewReply', async ({ id, reply }, { rejectWithValue }) => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { id, reply };
    } catch (error) {
        return rejectWithValue('Failed to add reply');
    }
});

export const addNewReview = createAsyncThunk<
    Review,
    AddNewReviewPayload,
    { rejectValue: string }
>('reviews/addNewReview', async (reviewData, { rejectWithValue }) => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const newReview: Review = {
            productId: 0, rating: 0, reviewerName: "", text: "",
            id: Date.now(),
            ...reviewData,
            date: new Date().toISOString().split('T')[0],
            isNew: true
        };
        return newReview;
    } catch (error) {
        return rejectWithValue('Failed to add new review');
    }
});

const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        markNotificationAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        },
        markReviewAsViewed: (state, action: PayloadAction<number>) => {
            const review = state.reviews.find((r) => r.id === action.payload);
            if (review) {
                review.isNew = false;
            }
        },
        clearReadNotifications: (state) => {
            state.notifications = state.notifications.filter((n) => !n.read);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addReviewReply.pending, (state) => {
                state.loading = true;
            })
            .addCase(addReviewReply.fulfilled, (state, action: PayloadAction<AddReviewReplyPayload>) => {
                state.loading = false;
                const review = state.reviews.find((r) => r.id === action.payload.id);
                if (review) {
                    review.reply = action.payload.reply;
                }
            })
            .addCase(addReviewReply.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Unknown error occurred';
            })
            .addCase(addNewReview.pending, (state) => {
                state.loading = true;
            })
            .addCase(addNewReview.fulfilled, (state, action: PayloadAction<Review>) => {
                state.loading = false;
                state.reviews.unshift(action.payload);

                const product = state.products.find((p) => p.id === action.payload.productId);
                if (product) {
                    const newNotification: Notification = {
                        id: `notif_${Date.now()}`,
                        type: 'new_review',
                        message: `Có đánh giá mới cho sản phẩm "${product.name}"`,
                        timestamp: new Date().toISOString(),
                        read: false,
                        reviewId: action.payload.id,
                        productId: action.payload.productId,
                    };
                    state.notifications.unshift(newNotification);

                    product.reviewCount += 1;
                    const productReviews = state.reviews.filter((r) => r.productId === product.id);
                    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
                    product.avgRating = Math.round(avgRating * 10) / 10;
                }
            })
            .addCase(addNewReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Unknown error occurred';
            });
    },
});

export const { markNotificationAsRead, removeNotification, markReviewAsViewed, clearReadNotifications } = reviewSlice.actions;

export default reviewSlice.reducer;