module.exports = {
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        // eslint-disable-next-line no-param-reassign
        args[0].title = '日記盒DiaryBox';
        return args;
      });
  },

  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',

  // 這是將bootstrap的variables和mixins導入到所有元件中的方式，讓這些內容可以在各個元件中使用
  productionSourceMap: false,

  css: {
    loaderOptions: {
      scss: {
        // eslint-disable-next-line quotes
        prependData: `@import "~bootstrap/scss/functions";
                      @import "~@/assets/scss/helpers/_variables";
                      @import "~bootstrap/scss/variables";
                      @import "~@/assets/scss/_customVariable";
                      `,
      },
    },
  },
};
