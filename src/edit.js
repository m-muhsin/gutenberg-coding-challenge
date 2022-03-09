/**
 * WordPress dependencies
 */
import { edit, globe } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { BlockControls, useBlockProps } from '@wordpress/block-editor';
import {
	ComboboxControl,
	Placeholder,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import countries from '../assets/countries.json';
import { getEmojiFlag } from './utils';
import Preview from './preview';
import './editor.scss';

// Data to populate the HTML options element.
const options = Object.entries( countries ).map( ( [ code, country ] ) => ( {
	value: code,
	label: `${ getEmojiFlag( code ) } ${ country }  — ${ code }`,
} ) );

export default function Edit( { attributes, setAttributes } ) {
	// Destructure the attributes.
	const { countryCode, relatedPosts } = attributes;

	// Use state with a default of false.
	const [ isPreview, setPreview ] = useState( false );

	// Double bang to make the state a boolean, runs on initial load and upon country code change.
	useEffect( () => setPreview( !! countryCode ), [ countryCode ] );

	// When the toolbar edit button is clicked, set isPreview to false.
	const handleChangeCountry = () => {
		if ( isPreview ) setPreview( false );
		else if ( countryCode ) setPreview( true );
	};

	// When a new country code is selected.
	const handleChangeCountryCode = ( newCountryCode ) => {
		if ( newCountryCode && countryCode !== newCountryCode ) {
			setAttributes( {
				countryCode: newCountryCode,
				relatedPosts: [],
			} );
		}
	};

	const { fetchedRelatedPosts } = useSelect( ( select ) => {
		const data = select( 'core' ).getEntityRecords( 'postType', 'post', {
			exclude: select( 'core/editor' ).getCurrentPostId(),
			search: countries[ countryCode ],
			fields: [ 'id', 'title', 'excerpt', 'link' ],
		} );

		return { fetchedRelatedPosts: data };
	} );

	useEffect( () => {
		async function getRelatedPosts() {
			const posts = fetchedRelatedPosts;

			// Set the related Post attributes.
			setAttributes( {
				relatedPosts:
					posts?.map( ( relatedPost ) => ( {
						...relatedPost,
						title: relatedPost.title?.rendered || relatedPost.link,
						excerpt: relatedPost.excerpt?.rendered || '',
					} ) ) || [],
			} );
		}

		getRelatedPosts();

		// Rerun this code if fetchedRelatedPosts or setAttributes changes.
	}, [ fetchedRelatedPosts, setAttributes ] );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={ __( 'Change Country', 'xwp-country-card' ) }
						icon={ edit }
						onClick={ handleChangeCountry }
						disabled={ ! Boolean( countryCode ) }
					/>
				</ToolbarGroup>
			</BlockControls>
			<div { ...useBlockProps() }>
				{ isPreview ? (
					<Preview
						countryCode={ countryCode }
						relatedPosts={ relatedPosts }
					/>
				) : (
					<Placeholder
						icon={ globe }
						label={ __( 'XWP Country Card', 'xwp-country-card' ) }
						isColumnLayout={ true }
						instructions={ __(
							'Type in a name of a country you want to display on your site.',
							'xwp-country-card'
						) }
					>
						<ComboboxControl
							label={ __( 'Country', 'xwp-country-card' ) }
							hideLabelFromVision
							options={ options }
							value={ countryCode }
							onChange={ handleChangeCountryCode }
							allowReset={ true }
						/>
					</Placeholder>
				) }
			</div>
		</>
	);
}
