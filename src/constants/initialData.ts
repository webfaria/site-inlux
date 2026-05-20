import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Anel Inlux Horizon',
    category: 'aneis',
    collection: 'Coleção Minimalist',
    price: 'R$ 450,00',
    ref: 'AUR-0012',
    status: 'EM ESTOQUE',
    tag: 'Novidade',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtDdpn4bclaXzpk8UPno34DsPoDp4tuezTEqBAdEiNDHzXUZLCzFWzEmDMOcBqwPytPwnzL8B22IdfyKuovld2LOMUdL7AkgIQ5H2yAJ1Wc4FsU84jBvURRg_F2WhJCXU1ACCHYPFWEbG6aSRUFpk5GfzUtl20Ua71q9Uck_a-Q1nYHRLLvt0CGQKsdBWxVe8vpwMV6R1WM6kcucLkMg7Dlg0CvOFPvqU1Sbm2CZekYi26d6UhK5EwJtkjpNwLpJGs-N4AIMGqGBL7'
  },
  {
    id: 2,
    title: 'Brincos Gota Luna',
    category: 'brincos',
    collection: 'Edição Heritage',
    price: 'R$ 620,00',
    ref: 'AUR-0045',
    status: 'EM ESTOQUE',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJyz-kkF3DBaKCp1pzfu-n5F4ypsWNXkPauSV2usGsQ9Kn5ECyoYGsh-HsJKUJlJkvI2yumcyAvxj_xQo7qhhOJnCYtso41BX6oP9nL9qjTuc7ATNud3JRSYJaM6eHefHUUDZK_UKpxNfgBAL5lDUkgMnsAt3qw6wfQB-evDHH-c3EpUFjrtxR1gX2lSUbW2068J9BHfb29l5AdgXQteuYmuLEzyahEWhkqDBqfcPqUZnM__GVxm6FP5EE7ixGctf-AtGiLymJT4i8'
  },
  {
    id: 3,
    title: 'Colar de Elos Ethereal',
    category: 'colares',
    collection: 'Série Clássica',
    price: 'R$ 890,00',
    ref: 'AUR-0089',
    status: 'BAIXO ESTOQUE',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGebwp6ZZJwSlMtvQxAkdGpxefbap6OCG8nHwxxR_cnl0b7d0-2j9EpWd5Eq7DwyLV9FZoDxTUS5sVYAhqdqirMBj3h-eSOaSRvG3v9nzxRN3V13spskIHLCwJtQB4fPR40ICoPwa8oCDtFP3kOKXJTelTbSGgaLlwqn43eVmhZuZ1uh6Ykcsnw9g_StjwNGyGpOMu6fTZx1qeOmshXnjR9hFJhSu2VUMuHvIEAL77XGIs_67xhl6-ydc9qoW7T_yeSsZPt9jmVtR'
  },
  {
    id: 4,
    title: 'Bracelete Rígido Vertex',
    category: 'pulseiras',
    collection: 'Peças Marcantes',
    price: 'R$ 1.250,00',
    ref: 'AUR-0122',
    status: 'ESGOTADO',
    tag: 'Limitado',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARH8n8CORRjQz1mVxywWkJBBJVsaGcUDGyb3sJTbjIThRVYKsRQgLdB-JYDVXl_36sVf7id-PlgSIr6LnwcY6g5Vr9sVX4QROZv7ctFDqwEMSQpHPkjxJ8PkBB4sDcdJIgcNYrJhR0xdSvVdaJU2PJnJC5evgPGUT0N3pEWDqEA6pIEpiljiH-L9nMkfRrRJyDR8XcJgFOCGbIBfbgr-k_ntbsrYmqlSCvpHdBCjLyT22wNs8AyuGTXAnPR1S3KSFo3-DXrs6S4XqC'
  },
  {
    id: 5,
    title: 'Colar Elo Fino Prata',
    category: 'colares',
    collection: 'Coleção Minimalist',
    price: 'R$ 380,00',
    tag: 'Novo',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVBzjAqMuu1yT1c6GB_YqWvIXSTxHiOKH4YImMD4Khb2ccdFo2FHycEnrPxu_j4g5wyD0y-vm_Dd4vFchGeAmO6J21oJKxCEiUjcCJpQl7Rr13rB5lF7kfRZk-XDXjut0cHOoGwAUY5EsssFOeC0A4UWFBUn3YiUyF4uSxK9tsN3WIa2Fyqk6yBA5i4beDsWJBou1CoID-PlzG3E9iGMPuG-5CFkCxhp68UU98G_ypevZPrqMBkYJwBFYSo1N9TNR47lm7QhR1JXLq'
  },
  {
    id: 6,
    title: 'Colar Prisma Brutalist',
    category: 'colares',
    collection: 'Peças Marcantes',
    price: 'R$ 720,00',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC84aDsdrD1BQRKPURKKFPohLiYjMISJjjG_wHG7_wer1jWCsXLs72dGgeWFJTm7ngZAqf59snuRbYzvbqdqym_G-Gz5LZDvoy6FjpetqXxhSpoWY9PGceL2Mwk_zKT0F9wz3TVM3a32YG79MAtwCSTFV6Twp8fqxkjOJiEkXOKEVI5M9On_rSFKk6P1sgHFFe0Rk3mcY_VE7KXBgjToH_2TVVnp-hcdS03RSrTwuakq04fL57oR0Nc9L_H9aC5mDo7bRz6v9k144RJ'
  },
  {
    id: 7,
    title: 'Brincos Heritage Hoop',
    category: 'brincos',
    collection: 'Edição Heritage',
    price: 'R$ 620,00',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzTZcQnC6ip3SiYVTaXk6wcntdIPW_ddJLL1bUwlol2U8qy2ya1VdlyxKQey6f_WhRW63sl8ZFvELVL75lyzX6WI_SQ5Bn6TGLSvjV_SdyKgRqRYCucnLdcessJhVl4YrA6gVAEF0B8X3oAfn1hiasZTqyhkoS1jT_KcGbtsVzjHnxCnPTNSLEtWq9Rz9dYg2ctNMEWzgvogta3wG5jI3OfVPXWV6DgMy6ZlKpo8nHkgOpnlImuA9_GHW-OgTbLS0OFe3xD-yBl7CB'
  },
];
