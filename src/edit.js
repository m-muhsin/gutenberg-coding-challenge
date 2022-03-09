/**
 * WordPress dependencies
 */
import { edit, globe } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
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

export default function Edit( { attributes, setAttributes } ) {
	// Destructure the attributes.
	const { countryCode, relatedPosts } = attributes;

	// Data to populate the HTML options element.
	const options = Object.keys( countries ).map( ( code ) => ( {
		value: code,
		label: `${ getEmojiFlag( code ) } ${ countries[ code ] }  — ${ code }`,
	} ) );

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

	useEffect( () => {
		async function getRelatedPosts() {
			// Getting current post to exclude it
			const postId = window.location.href.match( /post=([\d]+)/ )[ 1 ];

			// Use apiFetch insted of window.fetch
			const posts = await apiFetch( {
				path: `/wp/v2/posts?search=${ countries[ countryCode ] }&exclude=${ postId }`,
			} )
				// Use catch statement for any error handling.
				.catch( ( err ) => {
					throw new Error( `HTTP error! Status: ${ err }` );
				} );

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

		// Run this code if countryCode or setAttributes changes.
	}, [ countryCode, setAttributes ] );

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
