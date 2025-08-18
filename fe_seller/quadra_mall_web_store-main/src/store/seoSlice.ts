import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SEOState {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    canonicalUrl: string;
    ogType: string;
}

const initialState: SEOState = {
    title: 'QuadraMall - Mua sắm online',
    description: 'Cửa hàng trực tuyến uy tín với nhiều sản phẩm chất lượng',
    keywords: 'mua sắm, online, e-commerce',
    ogImage: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749617525/quadramall_logo_nho42w.png',
    canonicalUrl: 'https://res.cloudinary.com/dy5ic99dp/image/upload/v1749617525/quadramall_logo_nho42w.png',
    ogType: 'website'
}

export const seoSlice = createSlice({
    name: 'seo',
    initialState,
    reducers: {
        setSEOData: (state, action: PayloadAction<Partial<SEOState>>) => {
            return { ...state, ...action.payload }
        },
        resetSEO: (state) => {
            return initialState
        },
        updateTitle: (state, action: PayloadAction<string>) => {
            state.title = action.payload
        },
        updateDescription: (state, action: PayloadAction<string>) => {
            state.description = action.payload
        }
    }
})

export const { setSEOData, resetSEO, updateTitle, updateDescription } = seoSlice.actions
export default seoSlice.reducer