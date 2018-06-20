/**
 * External dependencies
 */
import classnames from 'classnames';
import ResizableBox from 're-resizable';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	BlockAlignmentToolbar,
	InnerBlocks,
	InspectorControls,
	getColorClass,
	PanelColorSettings,
	withColors,
	MediaPlaceholder,
} from '@wordpress/editor';
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

const MEDIA_POSITIONS = [ 'left', 'right' ];

export const name = 'core/half-media';
const ALLOWED_BLOCKS = [ 'core/button', 'core/paragraph', 'core/heading', 'core/list' ];

export const settings = {
	title: __( 'Half Media' ),

	icon: <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0,0h24v24H0V0z" fill="none" /><rect x="11" y="7" width="6" height="2" /><rect x="11" y="11" width="6" height="2" /><rect x="11" y="15" width="6" height="2" /><rect x="7" y="7" width="2" height="2" /><rect x="7" y="11" width="2" height="2" /><rect x="7" y="15" width="2" height="2" /><path d="M20.1,3H3.9C3.4,3,3,3.4,3,3.9v16.2C3,20.5,3.4,21,3.9,21h16.2c0.4,0,0.9-0.5,0.9-0.9V3.9C21,3.4,20.5,3,20.1,3z M19,19H5V5h14V19z" /></svg>,

	category: 'layout',

	attributes: {
		width: {
			type: 'number',
			default: 500,
		},
		backgroundColor: {
			type: 'string',
		},
		customBackgroundColor: {
			type: 'string',
		},
		mediaPosition: {
			type: 'string',
			default: 'left',
		},
		mediaUrl: {
			type: 'string',
			source: 'attribute',
			selector: 'video,img',
			attribute: 'src',
		},
		mediaType: {
			type: 'string',
		},
	},

	supports: {
		align: [ 'center', 'wide', 'full' ],
	},

	edit: compose( [
		withColors( 'backgroundColor' ),
		withSelect( ( select ) => {
			return {
				wideControlsEnabled: select( 'core/editor' ).getEditorSettings().alignWide,
			};
		} ),
	] )(
		class extends Component {
			componentWillMount() {
				if ( this.props.wideControlsEnabled && ! this.props.attributes.align ) {
					this.props.setAttributes( {
						align: 'wide',
					} );
				}
			}

			renderImage() {
				const { attributes } = this.props;
				const { mediaUrl } = attributes;
				return (
					<img src={ mediaUrl } alt="" />
				);
			}

			renderVideo() {
				const { attributes } = this.props;
				const { mediaUrl } = attributes;
				return (
					<video src={ mediaUrl } />
				);
			}

			renderPlaceholder() {
				const { setAttributes } = this.props;
				return (
					<MediaPlaceholder
						icon="format-image"
						labels={ {
							title: __( 'Media area' ),
							name: __( 'a media file (image or video)' ),
						} }
						className="block-library-half-media__media-placeholder"
						onSelect={ ( media ) => {
							setAttributes( {
								mediaType: media.type,
								mediaUrl: media.url,
							} );
						} }
						accept="image/*,video/*"
						type="image/*,video/*"
					/>
				);
			}

			renderInnerMediaArea() {
				const { attributes } = this.props;
				const { mediaUrl, mediaType } = attributes;
				if ( mediaType && mediaUrl ) {
					switch ( mediaType ) {
						case 'image':
							return this.renderImage();
						case 'video':
							return this.renderVideo();
					}
				}
				return this.renderPlaceholder();
			}

			renderMediaArea() {
				const { attributes, setAttributes } = this.props;
				const { width } = attributes;
				return (
					<ResizableBox
						className="block-library-half-media__resizer"
						size={ {
							width,
						} }
						minWidth="100"
						handleClasses={ {
							right: 'block-library-half-media__resize-handler-right',
						} }
						enable={ {
							top: false,
							right: true,
							bottom: false,
							left: false,
							topRight: false,
							bottomRight: false,
							bottomLeft: false,
							topLeft: false,
						} }
						onResizeStop={ ( event, direction, elt, delta ) => {
							window.console.log( delta );
							setAttributes( {
								width: parseInt( width + delta.width, 10 ),
							} );
						} }
						axis="x"
					>
						{ this.renderInnerMediaArea() }
					</ResizableBox>
				);
			}

			render() {
				const { attributes, backgroundColor, setAttributes, setBackgroundColor } = this.props;
				return (
					<div
						className={ classnames(
							'half-media',
							{
								'has-media-on-the-right': 'right' === attributes.mediaPosition,
								[ backgroundColor.class ]: backgroundColor.class,
							}
						) }
						style={ {
							backgroundColor: backgroundColor.value,
						} }
					>
						<InspectorControls>
							<PanelColorSettings
								title={ __( 'Color Settings' ) }
								initialOpen={ false }
								colorSettings={ [
									{
										value: backgroundColor.value,
										onChange: setBackgroundColor,
										label: __( 'Background Color' ),
									},
								] }
							/>
						</InspectorControls>
						<BlockControls>
							<BlockAlignmentToolbar
								controls={ MEDIA_POSITIONS }
								value={ attributes.mediaPosition }
								onChange={ ( mediaPosition ) => setAttributes( { mediaPosition } ) }
							/>
						</BlockControls>
						{ this.renderMediaArea() }
						<InnerBlocks
							template={ [
								[ 'core/paragraph', { fontSize: 'large', placeholder: 'Content...' } ],
							] }
							allowedBlocks={ ALLOWED_BLOCKS }
							templateLock={ false }
						/>
					</div>
				);
			}
		} ),

	save( { attributes } ) {
		const {
			backgroundColor,
			customBackgroundColor,
		} = attributes;
		const backgroundClass = getColorClass( 'background-color', backgroundColor );
		return (
			<div
				className={ classnames(
					'half-media',
					{
						'has-media-on-the-right': 'right' === attributes.mediaPosition,
						[ backgroundClass ]: backgroundClass,
					}
				) }
				style={ {
					backgroundColor: backgroundClass ? undefined : customBackgroundColor,
				} }
			>
				<InnerBlocks.Content />
			</div>
		);
	},
};
