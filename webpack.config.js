const webpack = require("webpack"),
	path = require("path"),
	{ CleanWebpackPlugin } = require("clean-webpack-plugin"),
	CopyWebpackPlugin = require("copy-webpack-plugin"),
	HtmlWebpackPlugin = require("html-webpack-plugin"),
	WriteFilePlugin = require("write-file-webpack-plugin"),
	TerserPlugin = require("terser-webpack-plugin"),
	OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin"),
	PrettierPlugin = require("prettier-webpack-plugin");

const fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

const options = {
	mode: process.env.NODE_ENV || "development",
	entry: {
		popup: path.join(__dirname, "src", "js", "popup.js"),
		options: path.join(__dirname, "src", "js", "options.js"),
		background: path.join(__dirname, "src", "js", "background.js"),
	},
	output: {
		path: path.join(__dirname, "build"),
		filename: "[name].bundle.js",
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					output: {
						comments: false,
					},
				},
			}),
			new OptimizeCssAssetsPlugin({
				cssProcessor: require("cssnano"),
				cssProcessorPluginOptions: {
					preset: [
						"default",
						{
							discardComments: {
								removeAll: true,
							},
						},
					],
				},
			}),
		],
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				loader: "style-loader!css-loader",
				exclude: /node_modules/,
			},
			{
				test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
				loader: "file-loader?name=[name].[ext]",
				exclude: /node_modules/,
			},
			{
				test: /\.html$/,
				loader: "html-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.svelte$/,
				exclude: /node_modules/,
				use: {
					loader: "svelte-loader",
					options: {
						emitCss: false,
						hotReload: false,
					},
				},
			},
		],
	},
	plugins: [
		// clean the build folder
		new CleanWebpackPlugin(),

		// expose and write the allowed env vars on the compiled bundle
		new webpack.DefinePlugin({
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
		}),
		new CopyWebpackPlugin([{ from: "src/manifest.json" }, { from: "src/img", to: "" }], { copyUnmodified: true }),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, "src", "popup.html"),
			filename: "popup.html",
			chunks: ["popup"],
		}),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, "src", "options.html"),
			filename: "options.html",
			chunks: ["options"],
		}),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, "src", "background.html"),
			filename: "background.html",
			chunks: ["background"],
		}),

		new WriteFilePlugin(),

		new PrettierPlugin(),
	],
};

if (process.env.NODE_ENV === "development") {
	options.devtool = "cheap-module-eval-source-map";
	options.plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = options;
