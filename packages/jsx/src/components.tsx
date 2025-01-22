import type {
	NubeComponentBox,
	NubeComponentBoxProps,
	NubeComponentCol,
	NubeComponentColProps,
	NubeComponentField,
	NubeComponentFieldProps,
	NubeComponentFragment,
	NubeComponentFragmentProps,
	NubeComponentImg,
	NubeComponentImgProps,
	NubeComponentRow,
	NubeComponentRowProps,
	NubeComponentTxt,
	NubeComponentTxtProps,
} from "@tiendanube/nube-sdk-types";
import {
	box,
	col,
	field,
	fragment,
	img,
	row,
	txt,
} from "@tiendanube/nube-sdk-ui";

export function Box(props: NubeComponentBoxProps): NubeComponentBox {
	return box(props);
}

export function Col(props: NubeComponentColProps): NubeComponentCol {
	return col(props);
}

export function Row(props: NubeComponentRowProps): NubeComponentRow {
	return row(props);
}

export function Field(props: NubeComponentFieldProps): NubeComponentField {
	return field(props);
}

export function Fragment(
	props: NubeComponentFragmentProps,
): NubeComponentFragment {
	return fragment(props);
}

export function Txt(props: NubeComponentTxtProps): NubeComponentTxt {
	return txt(props);
}

export function Img(props: NubeComponentImgProps): NubeComponentImg {
	return img(props);
}
